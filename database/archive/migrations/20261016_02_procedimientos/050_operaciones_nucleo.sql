CREATE OR ALTER PROCEDURE dbo.usp_Proforma_ComprobarJson @CabeceraJson nvarchar(max)=NULL,@LineasJson nvarchar(max)=NULL AS
BEGIN
 SET NOCOUNT ON;
 DECLARE @H table(Clave nvarchar(4000) COLLATE Latin1_General_100_BIN2,Valor nvarchar(max),Tipo int);
 DECLARE @L table(Linea int,Clave nvarchar(4000) COLLATE Latin1_General_100_BIN2,Valor nvarchar(max),Tipo int);
 IF @CabeceraJson IS NOT NULL BEGIN
  IF ISJSON(@CabeceraJson,OBJECT)<>1 THROW 52000,N'Cabecera JSON debe ser objeto.',1;
  INSERT @H SELECT [key],[value],[type] FROM OPENJSON(@CabeceraJson);
 END;
 IF @LineasJson IS NOT NULL BEGIN
  IF ISJSON(@LineasJson,ARRAY)<>1 THROW 52000,N'Lineas JSON debe ser arreglo.',1;
  IF EXISTS(SELECT 1 FROM OPENJSON(@LineasJson) WHERE [type]<>5) THROW 52000,N'Cada linea debe ser un objeto JSON.',1;
  INSERT @L SELECT CONVERT(int,j.[key]),v.[key],v.[value],v.[type] FROM OPENJSON(@LineasJson)j CROSS APPLY OPENJSON(j.[value])v;
 END;
 IF EXISTS(SELECT Clave FROM @H GROUP BY Clave HAVING COUNT(*)>1) OR EXISTS(SELECT Linea,Clave FROM @L GROUP BY Linea,Clave HAVING COUNT(*)>1)
 THROW 52000,N'El JSON contiene propiedades duplicadas.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave NOT IN(N'numeroProforma',N'tipoDocumento',N'nombreProveedorPdf',N'nombreNegocio',N'razonSocial',N'cedula',N'telefono',N'vendedor',N'condicionesPago',N'condicionesEntrega',N'observaciones',N'moneda',N'subtotal',N'descuento',N'iva',N'total',N'otrosCargos',N'fechaProforma',N'fechaVencimiento',N'diasCredito',N'datosProveedorOriginal',N'datosClienteOriginal'))
 OR EXISTS(SELECT 1 FROM @L WHERE Clave NOT IN(N'codigo',N'descripcion',N'tipoOferta',N'estadoOferta',N'nombreProductoOriginal',N'marcaOriginal',N'presentacionOriginal',N'codigoUnidadOriginal',N'tipoBaseOriginal',N'baseTotalLinea',N'motivoAlternativa',N'observacion',N'cantidadEmpaques',N'precioUnitario',N'descuentoPorcentaje',N'totalLinea',N'contenidoEmpaqueOriginal',N'factorConversionOriginal',N'contenidoNormalizadoOriginal',N'descuentoMonto',N'impuestoMonto',N'idSolicitudDetalle',N'numeroLinea',N'idProducto',N'idPresentacionProducto',N'idUnidadMedidaOriginal')) THROW 52000,N'Propiedad JSON desconocida; respete nombres camelCase del contrato.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'numeroProforma' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>100)) THROW 52000,N'numeroProforma: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'tipoDocumento' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>100)) THROW 52000,N'tipoDocumento: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'nombreProveedorPdf' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>400)) THROW 52000,N'nombreProveedorPdf: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'nombreNegocio' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>500)) THROW 52000,N'nombreNegocio: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'razonSocial' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>500)) THROW 52000,N'razonSocial: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'cedula' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>100)) THROW 52000,N'cedula: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'telefono' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>100)) THROW 52000,N'telefono: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'vendedor' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>300)) THROW 52000,N'vendedor: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'condicionesPago' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>2000)) THROW 52000,N'condicionesPago: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'condicionesEntrega' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>2000)) THROW 52000,N'condicionesEntrega: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'observaciones' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>4000)) THROW 52000,N'observaciones: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'moneda' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>6)) THROW 52000,N'moneda: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'codigo' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>200)) THROW 52000,N'codigo: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'descripcion' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>1000)) THROW 52000,N'descripcion: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'tipoOferta' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>40)) THROW 52000,N'tipoOferta: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'estadoOferta' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>40)) THROW 52000,N'estadoOferta: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'nombreProductoOriginal' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>300)) THROW 52000,N'nombreProductoOriginal: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'marcaOriginal' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>300)) THROW 52000,N'marcaOriginal: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'presentacionOriginal' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>300)) THROW 52000,N'presentacionOriginal: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'codigoUnidadOriginal' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>40)) THROW 52000,N'codigoUnidadOriginal: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'tipoBaseOriginal' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>40)) THROW 52000,N'tipoBaseOriginal: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'baseTotalLinea' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>60)) THROW 52000,N'baseTotalLinea: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'motivoAlternativa' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>2000)) THROW 52000,N'motivoAlternativa: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'observacion' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>2000)) THROW 52000,N'observacion: texto o longitud invalida.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'subtotal' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%'))) THROW 52000,N'subtotal: importe fuera de precision decimal(18,4).',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'descuento' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%'))) THROW 52000,N'descuento: importe fuera de precision decimal(18,4).',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'iva' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%'))) THROW 52000,N'iva: importe fuera de precision decimal(18,4).',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'total' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%'))) THROW 52000,N'total: importe fuera de precision decimal(18,4).',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'otrosCargos' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%'))) THROW 52000,N'otrosCargos: importe fuera de precision decimal(18,4).',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'cantidadEmpaques' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%'))) THROW 52000,N'cantidadEmpaques: numero fuera de precision admitida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'precioUnitario' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,6),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,6),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+7,4000) LIKE N'%[^0]%'))) THROW 52000,N'precioUnitario: numero fuera de precision admitida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'descuentoPorcentaje' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,2),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,2),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+3,4000) LIKE N'%[^0]%'))) THROW 52000,N'descuentoPorcentaje: numero fuera de precision admitida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'totalLinea' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%'))) THROW 52000,N'totalLinea: numero fuera de precision admitida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'contenidoEmpaqueOriginal' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,6),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,6),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+7,4000) LIKE N'%[^0]%'))) THROW 52000,N'contenidoEmpaqueOriginal: numero fuera de precision admitida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'factorConversionOriginal' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,6),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,6),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+7,4000) LIKE N'%[^0]%'))) THROW 52000,N'factorConversionOriginal: numero fuera de precision admitida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'contenidoNormalizadoOriginal' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,6),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,6),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+7,4000) LIKE N'%[^0]%'))) THROW 52000,N'contenidoNormalizadoOriginal: numero fuera de precision admitida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'descuentoMonto' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%'))) THROW 52000,N'descuentoMonto: numero fuera de precision admitida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave=N'impuestoMonto' AND Tipo<>0 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor) OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%'))) THROW 52000,N'impuestoMonto: numero fuera de precision admitida.',1;
 IF EXISTS(SELECT 1 FROM @L WHERE Clave IN(N'idSolicitudDetalle',N'numeroLinea',N'idProducto',N'idPresentacionProducto',N'idUnidadMedidaOriginal') AND Tipo<>0
 AND (Tipo NOT IN(1,2) OR TRY_CONVERT(bigint,Valor) IS NULL OR TRY_CONVERT(bigint,Valor)<=0)) THROW 52000,N'Identificador o numero de linea invalido.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave IN(N'fechaProforma',N'fechaVencimiento') AND Tipo<>0 AND (Tipo<>1 OR LEN(Valor)<>10 OR TRY_CONVERT(date,Valor,23) IS NULL)) THROW 52000,N'Fecha debe tener formato yyyy-MM-dd.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave=N'diasCredito' AND Tipo<>0 AND (TRY_CONVERT(int,Valor) IS NULL OR TRY_CONVERT(int,Valor)<0)) THROW 52000,N'Dias de credito invalidos.',1;
 IF EXISTS(SELECT 1 FROM @H WHERE Clave IN(N'datosProveedorOriginal',N'datosClienteOriginal') AND Tipo NOT IN(0,5)) THROW 52000,N'Los datos originales de las partes deben ser objetos JSON.',1;
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
  IF EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacionDetalle d JOIN dbo.Productos p ON p.IdProducto=d.IdProducto
  JOIN dbo.ProductosBase b ON b.IdProductoBase=p.IdProductoBase LEFT JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca
  JOIN dbo.PresentacionesProducto pp ON pp.IdPresentacionProducto=d.IdPresentacionProducto JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=pp.IdUnidadMedida
  WHERE d.IdSolicitudCotizacion=@IdSolicitudCotizacion AND (p.Activo=0 OR b.Activo=0 OR pp.Activo=0 OR u.Activo=0 OR (p.IdMarca IS NOT NULL AND m.Activo=0)))
  THROW 52000,N'La solicitud utiliza catalogos inactivos.',1;
  IF EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacionProveedor sp JOIN dbo.Proveedores p ON p.IdProveedor=sp.IdProveedor WHERE sp.IdSolicitudCotizacion=@IdSolicitudCotizacion AND p.Activo=0)
  THROW 52000,N'La solicitud contiene destinatarios inactivos.',1;
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
CREATE OR ALTER PROCEDURE dbo.usp_Proforma_Validar @IdProformaProveedor int AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION ValidarProforma;
 BEGIN TRY
  IF NOT EXISTS(SELECT 1 FROM dbo.ProformasProveedor WITH(UPDLOCK,HOLDLOCK)
  WHERE IdProformaProveedor=@IdProformaProveedor AND Estado IN('Borrador','EnRevision'))
  THROW 51206,N'La respuesta no existe o no se puede validar en su estado actual.',1;
  IF EXISTS(SELECT 1 FROM dbo.ProformasProveedor q JOIN dbo.Proveedores p ON p.IdProveedor=q.IdProveedor WHERE q.IdProformaProveedor=@IdProformaProveedor AND p.Activo=0)
  THROW 52000,N'El proveedor de la respuesta esta inactivo.',1;
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
CREATE OR ALTER PROCEDURE dbo.usp_Proforma_CrearRevision @IdProformaProveedor int,@IdNuevaProforma int OUTPUT AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION RevisionProforma;
 BEGIN TRY
  DECLARE @Destinatario bigint,@Documento bigint,@Importacion bigint,@Version int;
  SELECT @Destinatario=IdSolicitudCotizacionProveedor FROM dbo.ProformasProveedor WHERE IdProformaProveedor=@IdProformaProveedor;
  IF @Destinatario IS NULL THROW 52004,N'Cotizacion no existe.',1;
  SELECT @Destinatario=IdSolicitudCotizacionProveedor FROM dbo.SolicitudesCotizacionProveedor WITH(UPDLOCK,HOLDLOCK) WHERE IdSolicitudCotizacionProveedor=@Destinatario;
  SELECT @Documento=IdDocumentoOrigen,@Importacion=IdImportacionDocumento,@Version=VersionRespuesta FROM dbo.ProformasProveedor WITH(UPDLOCK,HOLDLOCK)
  WHERE IdProformaProveedor=@IdProformaProveedor AND Estado IN('Validada','Reemplazada','Cancelada');
  IF @Version IS NULL THROW 52010,N'Solo se revisa una respuesta finalizada.',1;
  IF EXISTS(SELECT 1 FROM dbo.ProformasProveedor WHERE IdSolicitudCotizacionProveedor=@Destinatario AND VersionRespuesta>@Version) THROW 52009,N'Ya existe una revision posterior.',1;
  DECLARE @Cabecera nvarchar(max)=(SELECT NumeroProforma AS numeroProforma,FechaProforma AS fechaProforma,FechaVencimiento AS fechaVencimiento,DiasCredito AS diasCredito,
  TipoDocumento AS tipoDocumento,Moneda AS moneda,NombreProveedorPdf AS nombreProveedorPdf,NombreNegocio AS nombreNegocio,RazonSocial AS razonSocial,Cedula AS cedula,
  Telefono AS telefono,Vendedor AS vendedor,Subtotal AS subtotal,Descuento AS descuento,IVA AS iva,Total AS total,OtrosCargos AS otrosCargos,
  JSON_QUERY(DatosProveedorOriginalJson) AS datosProveedorOriginal,JSON_QUERY(DatosClienteOriginalJson) AS datosClienteOriginal,
  CondicionesPago AS condicionesPago,CondicionesEntrega AS condicionesEntrega,Observaciones AS observaciones FROM dbo.ProformasProveedor
  WHERE IdProformaProveedor=@IdProformaProveedor FOR JSON PATH,INCLUDE_NULL_VALUES,WITHOUT_ARRAY_WRAPPER);
  DECLARE @Lineas nvarchar(max)=(SELECT IdSolicitudCotizacionDetalle AS idSolicitudDetalle,NumeroLineaDocumento AS numeroLinea,CodigoProveedor AS codigo,DescripcionProveedor AS descripcion,
  IdProducto AS idProducto,IdPresentacionProducto AS idPresentacionProducto,Cantidad AS cantidadEmpaques,PrecioUnitario AS precioUnitario,DescuentoPorcentaje AS descuentoPorcentaje,
  TotalLinea AS totalLinea,TipoOferta AS tipoOferta,EstadoOferta AS estadoOferta,NombreProductoOriginal AS nombreProductoOriginal,MarcaOriginal AS marcaOriginal,
  PresentacionOriginal AS presentacionOriginal,ContenidoEmpaqueOriginal AS contenidoEmpaqueOriginal,IdUnidadMedidaOriginal AS idUnidadMedidaOriginal,
  CodigoUnidadOriginal AS codigoUnidadOriginal,TipoBaseOriginal AS tipoBaseOriginal,FactorConversionOriginal AS factorConversionOriginal,
  ContenidoNormalizadoOriginal AS contenidoNormalizadoOriginal,DescuentoMonto AS descuentoMonto,ImpuestoMonto AS impuestoMonto,BaseTotalLinea AS baseTotalLinea,
  MotivoAlternativa AS motivoAlternativa,ObservacionValidacion AS observacion FROM dbo.ProformasProveedorDetalle WHERE IdProformaProveedor=@IdProformaProveedor
  ORDER BY IdProformaProveedorDetalle FOR JSON PATH,INCLUDE_NULL_VALUES);
  EXEC dbo.usp_Proforma_GuardarBorrador @Destinatario,@Documento,@Importacion,@Cabecera,@Lineas,@IdNuevaProforma OUTPUT;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK; ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION RevisionProforma;
  THROW;
 END CATCH;
END;
GO
