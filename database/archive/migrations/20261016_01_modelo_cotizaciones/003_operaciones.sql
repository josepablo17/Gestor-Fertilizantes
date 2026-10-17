/* Operaciones transaccionales del nuevo contrato. La API debe adoptarlas. */
CREATE OR ALTER PROCEDURE dbo.usp_Solicitud_Emitir @IdSolicitudCotizacion bigint AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION EmitirSolicitud;
 BEGIN TRY
  IF NOT EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacion WITH(UPDLOCK,HOLDLOCK)
  WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion AND Estado='Borrador')
  THROW 51200,N'La solicitud no existe o ya no es borrador.',1;
  UPDATE dbo.SolicitudesCotizacion SET Estado='Emitida',FechaEmision=SYSUTCDATETIME(),FechaModificacion=SYSUTCDATETIME()
  WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION EmitirSolicitud;
  THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Proforma_GuardarBorrador
 @IdSolicitudCotizacionProveedor bigint,
 @IdDocumentoOrigen bigint,
 @IdImportacionDocumento bigint=NULL,
 @CabeceraJson nvarchar(max),
 @LineasJson nvarchar(max),
 @IdProformaProveedor int OUTPUT
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF ISNULL(ISJSON(@CabeceraJson,OBJECT),0)<>1 OR ISNULL(ISJSON(@LineasJson,ARRAY),0)<>1
 THROW 51201,N'La cabecera debe ser un objeto JSON y las lineas un arreglo JSON.',1;
 IF NOT EXISTS(SELECT 1 FROM OPENJSON(@LineasJson)) THROW 51202,N'Debe proporcionar al menos una linea.',1;
 IF EXISTS(SELECT 1 FROM OPENJSON(@LineasJson) WHERE [type]<>5) THROW 51202,N'Cada linea debe ser un objeto JSON.',1;
 IF JSON_VALUE(@CabeceraJson,'$.moneda') IS NOT NULL AND
 (LEN(JSON_VALUE(@CabeceraJson,'$.moneda'))<>3 OR JSON_VALUE(@CabeceraJson,'$.moneda') COLLATE Latin1_General_100_BIN2 LIKE '%[^A-Z]%')
 THROW 51203,N'La moneda debe ser un codigo de tres letras mayusculas.',1;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION GuardarProforma;
 BEGIN TRY
  DECLARE @IdSolicitud bigint,@IdProveedor int,@Version int=1,@Anterior int=NULL;
  SELECT @IdSolicitud=IdSolicitudCotizacion,@IdProveedor=IdProveedor FROM dbo.SolicitudesCotizacionProveedor WITH(UPDLOCK,HOLDLOCK)
  WHERE IdSolicitudCotizacionProveedor=@IdSolicitudCotizacionProveedor;
  IF @IdSolicitud IS NULL THROW 51204,N'El destinatario de la solicitud no existe.',1;
  SELECT TOP(1) @Version=VersionRespuesta+1,@Anterior=IdProformaProveedor FROM dbo.ProformasProveedor WITH(UPDLOCK,HOLDLOCK)
  WHERE IdSolicitudCotizacionProveedor=@IdSolicitudCotizacionProveedor ORDER BY VersionRespuesta DESC;
  IF EXISTS(SELECT 1 FROM dbo.ProformasProveedor WHERE IdProformaProveedor=@Anterior AND Estado NOT IN('Validada','Reemplazada','Cancelada'))
  THROW 51205,N'Ya hay una respuesta en borrador o revision. Complete o cancele esa version.',1;
  INSERT dbo.ProformasProveedor(IdSolicitudCotizacionProveedor,IdSolicitudCotizacion,IdProveedor,VersionRespuesta,IdProformaAnterior,
   IdDocumentoOrigen,IdImportacionDocumento,NumeroProforma,FechaProforma,FechaVencimiento,DiasCredito,TipoDocumento,Moneda,
   NombreProveedorPdf,NombreNegocio,RazonSocial,Cedula,Telefono,Vendedor,Subtotal,Descuento,IVA,Total,OtrosCargos,
   DatosProveedorOriginalJson,DatosClienteOriginalJson,CondicionesPago,CondicionesEntrega,Observaciones)
  SELECT @IdSolicitudCotizacionProveedor,@IdSolicitud,@IdProveedor,@Version,@Anterior,@IdDocumentoOrigen,@IdImportacionDocumento,
   NumeroProforma,FechaProforma,FechaVencimiento,DiasCredito,TipoDocumento,Moneda,
   NombreProveedorPdf,NombreNegocio,RazonSocial,Cedula,Telefono,Vendedor,Subtotal,Descuento,IVA,Total,OtrosCargos,
   DatosProveedorOriginalJson,DatosClienteOriginalJson,CondicionesPago,CondicionesEntrega,Observaciones
  FROM OPENJSON(@CabeceraJson) WITH(
   NumeroProforma nvarchar(50) '$.numeroProforma',FechaProforma date '$.fechaProforma',FechaVencimiento date '$.fechaVencimiento',
   DiasCredito int '$.diasCredito',TipoDocumento nvarchar(50) '$.tipoDocumento',Moneda char(3) '$.moneda',
   NombreProveedorPdf nvarchar(200) '$.nombreProveedorPdf',NombreNegocio nvarchar(250) '$.nombreNegocio',
   RazonSocial nvarchar(250) '$.razonSocial',Cedula nvarchar(50) '$.cedula',Telefono nvarchar(50) '$.telefono',Vendedor nvarchar(150) '$.vendedor',
   Subtotal decimal(18,4) '$.subtotal',Descuento decimal(18,4) '$.descuento',IVA decimal(18,4) '$.iva',Total decimal(18,4) '$.total',OtrosCargos decimal(18,4) '$.otrosCargos',
   DatosProveedorOriginalJson nvarchar(max) '$.datosProveedorOriginal' AS JSON,DatosClienteOriginalJson nvarchar(max) '$.datosClienteOriginal' AS JSON,
   CondicionesPago nvarchar(1000) '$.condicionesPago',CondicionesEntrega nvarchar(1000) '$.condicionesEntrega',Observaciones nvarchar(2000) '$.observaciones');
  SET @IdProformaProveedor=CONVERT(int,SCOPE_IDENTITY());
  INSERT dbo.ProformasProveedorDetalle(IdProformaProveedor,IdSolicitudCotizacion,IdSolicitudCotizacionDetalle,NumeroLineaDocumento,
   CodigoProveedor,DescripcionProveedor,IdProducto,IdPresentacionProducto,Cantidad,PrecioUnitario,DescuentoPorcentaje,TotalLinea,
   TipoOferta,EstadoOferta,EstadoRevision,NombreProductoOriginal,MarcaOriginal,PresentacionOriginal,ContenidoEmpaqueOriginal,
   IdUnidadMedidaOriginal,CodigoUnidadOriginal,TipoBaseOriginal,FactorConversionOriginal,ContenidoNormalizadoOriginal,
   DescuentoMonto,ImpuestoMonto,BaseTotalLinea,MotivoAlternativa,ObservacionValidacion)
  SELECT @IdProformaProveedor,@IdSolicitud,IdSolicitudDetalle,NumeroLinea,Codigo,Descripcion,IdProducto,IdPresentacion,Cantidad,Precio,DescuentoPorcentaje,Total,
   COALESCE(TipoOferta,'Solicitada'),COALESCE(EstadoOferta,'Cotizada'),'Pendiente',NombreProducto,Marca,Presentacion,ContenidoEmpaque,
   IdUnidad,CodigoUnidad,TipoBase,Factor,ContenidoNormalizado,DescuentoMonto,ImpuestoMonto,COALESCE(BaseTotal,'SinDefinir'),MotivoAlternativa,Observacion
  FROM OPENJSON(@LineasJson) WITH(
   IdSolicitudDetalle bigint '$.idSolicitudDetalle',NumeroLinea int '$.numeroLinea',Codigo nvarchar(100) '$.codigo',Descripcion nvarchar(500) '$.descripcion',
   IdProducto int '$.idProducto',IdPresentacion int '$.idPresentacionProducto',Cantidad decimal(18,4) '$.cantidadEmpaques',Precio decimal(18,6) '$.precioUnitario',
   DescuentoPorcentaje decimal(5,2) '$.descuentoPorcentaje',Total decimal(18,4) '$.totalLinea',TipoOferta varchar(20) '$.tipoOferta',EstadoOferta varchar(20) '$.estadoOferta',
   NombreProducto nvarchar(150) '$.nombreProductoOriginal',Marca nvarchar(150) '$.marcaOriginal',Presentacion nvarchar(150) '$.presentacionOriginal',
   ContenidoEmpaque decimal(18,6) '$.contenidoEmpaqueOriginal',IdUnidad int '$.idUnidadMedidaOriginal',CodigoUnidad nvarchar(20) '$.codigoUnidadOriginal',
   TipoBase nvarchar(20) '$.tipoBaseOriginal',Factor decimal(18,6) '$.factorConversionOriginal',ContenidoNormalizado decimal(18,6) '$.contenidoNormalizadoOriginal',
   DescuentoMonto decimal(18,4) '$.descuentoMonto',ImpuestoMonto decimal(18,4) '$.impuestoMonto',BaseTotal varchar(30) '$.baseTotalLinea',
   MotivoAlternativa nvarchar(1000) '$.motivoAlternativa',Observacion nvarchar(1000) '$.observacion');
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION GuardarProforma;
  THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Proforma_Validar @IdProformaProveedor int AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION ValidarProforma;
 BEGIN TRY
  IF NOT EXISTS(SELECT 1 FROM dbo.ProformasProveedor WITH(UPDLOCK,HOLDLOCK)
  WHERE IdProformaProveedor=@IdProformaProveedor AND Estado IN('Borrador','EnRevision'))
  THROW 51206,N'La respuesta no existe o no se puede validar en su estado actual.',1;
  UPDATE dbo.ProformasProveedor SET Estado='Validada',FechaValidacion=SYSUTCDATETIME(),FechaModificacion=SYSUTCDATETIME()
  WHERE IdProformaProveedor=@IdProformaProveedor;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION ValidarProforma;
  THROW;
 END CATCH;
END;
GO
/* Requiere proveedor. Ya no devuelve equivalencias de otra empresa ni elige
   arbitrariamente cuando la descripcion tiene varias coincidencias activas. */
CREATE OR ALTER PROCEDURE dbo.SP_CompraAutomatica_BuscarEquivalencia
 @CodigoProveedor nvarchar(100)=NULL,@DescripcionProveedor nvarchar(300),@IdProveedor int
AS
BEGIN
 SET NOCOUNT ON;
 DECLARE @Codigo nvarchar(100)=NULLIF(UPPER(LTRIM(RTRIM(@CodigoProveedor))),N'');
 DECLARE @Descripcion nvarchar(300)=NULLIF(UPPER(LTRIM(RTRIM(@DescripcionProveedor))),N'');
 IF @Codigo IS NOT NULL AND EXISTS(SELECT 1 FROM dbo.CompraAutomaticaEquivalencias e
 JOIN dbo.Productos p ON p.IdProducto=e.IdProducto AND p.Activo=1
 LEFT JOIN dbo.PresentacionesProducto pp ON pp.IdPresentacionProducto=e.IdPresentacionProducto
 WHERE e.IdProveedor=@IdProveedor AND e.CodigoNormalizado=@Codigo AND e.Activo=1 AND (e.IdPresentacionProducto IS NULL OR pp.Activo=1))
 BEGIN
  SELECT e.IdProducto,e.IdPresentacionProducto,p.Nombre AS NombreProducto,ISNULL(pp.Descripcion,N'') AS NombrePresentacion
  FROM dbo.CompraAutomaticaEquivalencias e JOIN dbo.Productos p ON p.IdProducto=e.IdProducto AND p.Activo=1
  LEFT JOIN dbo.PresentacionesProducto pp ON pp.IdPresentacionProducto=e.IdPresentacionProducto
  WHERE e.IdProveedor=@IdProveedor AND e.CodigoNormalizado=@Codigo AND e.Activo=1 AND (e.IdPresentacionProducto IS NULL OR pp.Activo=1);
  RETURN;
 END;
 IF (SELECT COUNT(*) FROM dbo.CompraAutomaticaEquivalencias e
 JOIN dbo.Productos p ON p.IdProducto=e.IdProducto AND p.Activo=1
 LEFT JOIN dbo.PresentacionesProducto pp ON pp.IdPresentacionProducto=e.IdPresentacionProducto
 WHERE e.IdProveedor=@IdProveedor AND UPPER(LTRIM(RTRIM(e.DescripcionProveedor)))=@Descripcion AND e.Activo=1
 AND (e.IdPresentacionProducto IS NULL OR pp.Activo=1))>1
 THROW 51207,N'La descripcion corresponde a varias equivalencias del proveedor; requiere seleccion manual.',1;
 SELECT e.IdProducto,e.IdPresentacionProducto,p.Nombre AS NombreProducto,ISNULL(pp.Descripcion,N'') AS NombrePresentacion
 FROM dbo.CompraAutomaticaEquivalencias e JOIN dbo.Productos p ON p.IdProducto=e.IdProducto AND p.Activo=1
 LEFT JOIN dbo.PresentacionesProducto pp ON pp.IdPresentacionProducto=e.IdPresentacionProducto
 WHERE e.IdProveedor=@IdProveedor AND UPPER(LTRIM(RTRIM(e.DescripcionProveedor)))=@Descripcion AND e.Activo=1
 AND (e.IdPresentacionProducto IS NULL OR pp.Activo=1);
END;
GO
/* No convierte monedas, no reparte impuestos ni descuentos globales. El costo
   efectivo de comparacion se definira al acordar esas politicas. */
CREATE OR ALTER VIEW dbo.vw_OfertasValidadasVigentes AS
WITH Vigentes AS(
 SELECT p.*,ROW_NUMBER() OVER(PARTITION BY p.IdSolicitudCotizacionProveedor ORDER BY p.VersionRespuesta DESC) AS Orden
 FROM dbo.ProformasProveedor p WHERE p.Estado='Validada'
)
SELECT p.IdProformaProveedor,p.IdSolicitudCotizacion,p.IdSolicitudCotizacionProveedor,p.IdProveedor,p.VersionRespuesta,
 p.Moneda,p.FechaProforma,p.FechaVencimiento,d.IdProformaProveedorDetalle,d.IdSolicitudCotizacionDetalle,d.TipoOferta,
 d.NombreProductoOriginal,d.MarcaOriginal,d.PresentacionOriginal,d.Cantidad AS CantidadEmpaques,
 d.ContenidoEmpaqueOriginal,d.CodigoUnidadOriginal,d.TipoBaseOriginal,d.ContenidoNormalizadoOriginal,
 d.PrecioUnitario AS PrecioPorEmpaqueDocumento,d.TotalLinea,d.BaseTotalLinea,
 CONVERT(decimal(28,6),CONVERT(decimal(28,6),d.Cantidad)*d.ContenidoNormalizadoOriginal) AS ContenidoTotalNormalizado,
 CONVERT(decimal(28,8),d.PrecioUnitario/NULLIF(d.ContenidoNormalizadoOriginal,0)) AS PrecioDocumentoPorUnidadBase
FROM Vigentes p JOIN dbo.ProformasProveedorDetalle d ON d.IdProformaProveedor=p.IdProformaProveedor
WHERE p.Orden=1 AND d.EstadoOferta='Cotizada' AND d.EstadoRevision='Revisada';
GO
IF EXISTS(SELECT 1 FROM sys.extended_properties WHERE class=0 AND name=N'GestorFertilizantes.SchemaVersion')
 EXEC sys.sp_updateextendedproperty @name=N'GestorFertilizantes.SchemaVersion',@value=N'2026-10-16-cotizaciones-v1';
ELSE
 EXEC sys.sp_addextendedproperty @name=N'GestorFertilizantes.SchemaVersion',@value=N'2026-10-16-cotizaciones-v1';
GO
