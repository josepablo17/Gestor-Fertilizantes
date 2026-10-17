
CREATE   PROCEDURE dbo.usp_Proforma_GuardarBorrador
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
 EXEC dbo.usp_Proforma_ComprobarJson @CabeceraJson,@LineasJson;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION GuardarProforma;
 BEGIN TRY
  DECLARE @IdSolicitud bigint,@IdProveedor int,@Version int=1,@Anterior int=NULL;
  SELECT @IdSolicitud=IdSolicitudCotizacion,@IdProveedor=IdProveedor FROM dbo.SolicitudesCotizacionProveedor WITH(UPDLOCK,HOLDLOCK)
  WHERE IdSolicitudCotizacionProveedor=@IdSolicitudCotizacionProveedor;
  IF NOT EXISTS(SELECT 1 FROM dbo.Proveedores WHERE IdProveedor=@IdProveedor AND Activo=1) THROW 52000,N'Proveedor inexistente o inactivo.',1;
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
  UPDATE dbo.SolicitudesCotizacionProveedor SET Estado='Respondida',FechaRespuesta=COALESCE(FechaRespuesta,SYSUTCDATETIME())
  WHERE IdSolicitudCotizacionProveedor=@IdSolicitudCotizacionProveedor AND FechaEnvio IS NOT NULL AND Estado IN('Enviada','Respondida','Declinada');
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION GuardarProforma;
  THROW;
 END CATCH;
END;

GO
