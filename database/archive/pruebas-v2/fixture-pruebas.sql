SET NOCOUNT ON;
DECLARE @P int,@PP int,@U int,@CodigoUnidad nvarchar(20),@TipoBase nvarchar(20),@Factor decimal(18,6),
 @Contenido decimal(18,6),@Normalizada decimal(18,6),@Nombre nvarchar(150),@Marca nvarchar(150),@Presentacion nvarchar(150),
 @Proveedor int,@OtroProveedor int,@OtroProducto int,@OtraPresentacion int;
SELECT TOP(1) @P=p.IdProducto,@PP=pp.IdPresentacionProducto,@U=u.IdUnidadMedida,@CodigoUnidad=u.Codigo,@TipoBase=u.TipoBase,
 @Factor=u.FactorConversion,@Contenido=pp.Cantidad,@Normalizada=pp.CantidadNormalizada,@Nombre=p.Nombre,@Marca=p.Marca,@Presentacion=pp.Descripcion
FROM dbo.PresentacionesProducto pp JOIN dbo.Productos p ON p.IdProducto=pp.IdProducto
JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=pp.IdUnidadMedida WHERE p.Activo=1 AND pp.Activo=1 AND u.Activo=1 ORDER BY pp.IdPresentacionProducto;
SELECT @Proveedor=MIN(IdProveedor),@OtroProveedor=MAX(IdProveedor) FROM dbo.Proveedores WHERE Activo=1;
SELECT TOP(1) @OtroProducto=IdProducto,@OtraPresentacion=IdPresentacionProducto FROM dbo.PresentacionesProducto WHERE IdProducto<>@P ORDER BY IdPresentacionProducto;
IF @P IS NULL OR @Proveedor IS NULL OR @OtroProveedor=@Proveedor OR @OtraPresentacion IS NULL
 THROW 51900,N'El catalogo no contiene los datos minimos para ejecutar esta prueba.',1;

DECLARE @DocumentoEnviado bigint,@DocumentoRecibido bigint,@DocumentoOtro bigint,@Importacion bigint;
INSERT dbo.Documentos(NombreOriginal,RutaAlmacenamiento,Sha256,TamanoBytes,Origen,VersionPlantilla)
VALUES(N'prueba-solicitud.pdf',N'pruebas-rollback/solicitud.pdf',HASHBYTES('SHA2_256',N'prueba-solicitud'),100,'Generado',N'1');
SET @DocumentoEnviado=SCOPE_IDENTITY();
INSERT dbo.Documentos(NombreOriginal,RutaAlmacenamiento,Sha256,TamanoBytes,Origen)
VALUES(N'prueba-respuesta.pdf',N'pruebas-rollback/respuesta.pdf',HASHBYTES('SHA2_256',N'prueba-respuesta'),100,'Recibido');
SET @DocumentoRecibido=SCOPE_IDENTITY();
INSERT dbo.Documentos(NombreOriginal,RutaAlmacenamiento,Sha256,TamanoBytes,Origen)
VALUES(N'prueba-otra.pdf',N'pruebas-rollback/otra.pdf',HASHBYTES('SHA2_256',N'prueba-otra'),100,'Recibido');
SET @DocumentoOtro=SCOPE_IDENTITY();
INSERT dbo.ImportacionesDocumento(IdDocumento,VersionLector,Metodo,Estado,DatosExtraidosJson)
VALUES(@DocumentoRecibido,N'prueba-rollback','Manual','Completada',N'{"texto":"dato original de prueba"}');
SET @Importacion=SCOPE_IDENTITY();

DECLARE @S1 bigint,@S2 bigint,@D1 bigint,@D2 bigint,@SP1 bigint,@SP2 bigint;
INSERT dbo.SolicitudesCotizacion(NumeroSolicitud,FechaSolicitud,DatosClienteOriginalJson)
VALUES(N'PRUEBA-ROLLBACK-A',CONVERT(date,'20261016'),N'{"nombre":"Cliente de prueba"}');
SET @S1=SCOPE_IDENTITY();
INSERT dbo.SolicitudesCotizacion(NumeroSolicitud,FechaSolicitud,DatosClienteOriginalJson)
VALUES(N'PRUEBA-ROLLBACK-B',CONVERT(date,'20261016'),N'{"nombre":"Cliente de prueba"}');
SET @S2=SCOPE_IDENTITY();
INSERT dbo.SolicitudesCotizacionDetalle(IdSolicitudCotizacion,NumeroLinea,IdProducto,IdPresentacionProducto,CantidadEmpaquesSolicitada,
 NombreProductoOriginal,MarcaOriginal,PresentacionOriginal,ContenidoEmpaqueOriginal,IdUnidadMedidaOriginal,CodigoUnidadOriginal,
 TipoBaseOriginal,FactorConversionOriginal,ContenidoNormalizadoOriginal)
VALUES(@S1,1,@P,@PP,2,@Nombre,@Marca,@Presentacion,@Contenido,@U,@CodigoUnidad,@TipoBase,@Factor,@Normalizada);
SET @D1=SCOPE_IDENTITY();
INSERT dbo.SolicitudesCotizacionDetalle(IdSolicitudCotizacion,NumeroLinea,IdProducto,IdPresentacionProducto,CantidadEmpaquesSolicitada,
 NombreProductoOriginal,MarcaOriginal,PresentacionOriginal,ContenidoEmpaqueOriginal,IdUnidadMedidaOriginal,CodigoUnidadOriginal,
 TipoBaseOriginal,FactorConversionOriginal,ContenidoNormalizadoOriginal)
VALUES(@S2,1,@P,@PP,2,@Nombre,@Marca,@Presentacion,@Contenido,@U,@CodigoUnidad,@TipoBase,@Factor,@Normalizada);
SET @D2=SCOPE_IDENTITY();
INSERT dbo.SolicitudesCotizacionProveedor(IdSolicitudCotizacion,IdProveedor)VALUES(@S1,@Proveedor);
SET @SP1=SCOPE_IDENTITY();
INSERT dbo.SolicitudesCotizacionProveedor(IdSolicitudCotizacion,IdProveedor)VALUES(@S2,@Proveedor);
SET @SP2=SCOPE_IDENTITY();
-- TEST_BEFORE_EMIT
EXEC dbo.usp_Solicitud_Emitir @S1;
EXEC dbo.usp_Solicitud_Emitir @S2;
UPDATE dbo.SolicitudesCotizacionProveedor SET Estado='Enviada',IdDocumentoEnviado=@DocumentoEnviado,FechaEnvio=SYSUTCDATETIME()
WHERE IdSolicitudCotizacionProveedor IN(@SP1,@SP2);

DECLARE @Cabecera nvarchar(max)=N'{"numeroProforma":"PRUEBA-1","fechaProforma":"2026-10-16","moneda":"CRC","subtotal":200,"descuento":0,"iva":0,"total":200,"otrosCargos":0,"datosProveedorOriginal":{"nombre":"Proveedor de prueba"},"datosClienteOriginal":{"nombre":"Cliente de prueba"}}';
DECLARE @Lineas nvarchar(max)=(SELECT @D1 AS idSolicitudDetalle,1 AS numeroLinea,N'COD-PRUEBA' AS codigo,@Nombre AS descripcion,
 @P AS idProducto,@PP AS idPresentacionProducto,2 AS cantidadEmpaques,100 AS precioUnitario,0 AS descuentoPorcentaje,200 AS totalLinea,
 @Nombre AS nombreProductoOriginal,@Marca AS marcaOriginal,@Presentacion AS presentacionOriginal,@Contenido AS contenidoEmpaqueOriginal,
 @U AS idUnidadMedidaOriginal,@CodigoUnidad AS codigoUnidadOriginal,@TipoBase AS tipoBaseOriginal,@Factor AS factorConversionOriginal,
 @Normalizada AS contenidoNormalizadoOriginal,'Bruto' AS baseTotalLinea FOR JSON PATH);
DECLARE @Q int,@QD int;
EXEC dbo.usp_Proforma_GuardarBorrador @SP1,@DocumentoRecibido,@Importacion,@Cabecera,@Lineas,@Q OUTPUT;
SELECT @QD=IdProformaProveedorDetalle FROM dbo.ProformasProveedorDetalle WHERE IdProformaProveedor=@Q;
