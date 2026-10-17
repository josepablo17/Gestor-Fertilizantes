/* Ejecutar en BDComprasFertilizantes mediante una transaccion externa.
   No elimina datos. Las agrupaciones migradas requieren revision comercial.
   El script exige la base auditada y aplica una sola vez esta version. */
SET NOCOUNT ON;
SET XACT_ABORT ON;
IF DB_NAME()<>N'BDComprasFertilizantes' THROW 51000,N'Base de datos de destino incorrecta.',1;
IF @@TRANCOUNT=0 THROW 51000,N'La migracion debe ejecutarse en una transaccion.',1;
IF OBJECT_ID(N'dbo.SolicitudesCotizacion',N'U') IS NOT NULL THROW 51000,N'El modelo ya existe; no se aplicara nuevamente.',1;
IF EXISTS(SELECT 1 FROM dbo.Compras) OR EXISTS(SELECT 1 FROM dbo.ProformasProveedor)
 OR EXISTS(SELECT 1 FROM dbo.ProformasProveedorDetalle) OR EXISTS(SELECT 1 FROM dbo.CompraAutomaticaEquivalencias)
 THROW 51000,N'Hay documentos o equivalencias nuevos. Revisar su migracion antes de continuar.',1;

CREATE TABLE dbo.Marcas(
 IdMarca int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Marcas PRIMARY KEY,
 Nombre nvarchar(150) NOT NULL,
 NombreNormalizado AS UPPER(LTRIM(RTRIM(Nombre))) PERSISTED,
 Activo bit NOT NULL CONSTRAINT DF_Marcas_Activo DEFAULT(1),
 FechaCreacion datetime2(3) NOT NULL CONSTRAINT DF_Marcas_FechaCreacion DEFAULT(SYSUTCDATETIME()),
 FechaModificacion datetime2(3) NULL,
 CONSTRAINT CK_Marcas_Nombre CHECK(LEN(LTRIM(RTRIM(Nombre)))>0)
);
CREATE UNIQUE INDEX UX_Marcas_Nombre ON dbo.Marcas(NombreNormalizado);

CREATE TABLE dbo.ProductosBase(
 IdProductoBase int IDENTITY(1,1) NOT NULL CONSTRAINT PK_ProductosBase PRIMARY KEY,
 Codigo nvarchar(40) NOT NULL,
 Nombre nvarchar(150) NOT NULL,
 FormulaDeclarada nvarchar(100) NULL,
 Descripcion nvarchar(500) NULL,
 ComparabilidadRevisada bit NOT NULL CONSTRAINT DF_ProductosBase_Revisada DEFAULT(0),
 Activo bit NOT NULL CONSTRAINT DF_ProductosBase_Activo DEFAULT(1),
 FechaCreacion datetime2(3) NOT NULL CONSTRAINT DF_ProductosBase_FechaCreacion DEFAULT(SYSUTCDATETIME()),
 FechaModificacion datetime2(3) NULL,
 CONSTRAINT UQ_ProductosBase_Codigo UNIQUE(Codigo),
 CONSTRAINT CK_ProductosBase_Texto CHECK(LEN(LTRIM(RTRIM(Codigo)))>0 AND LEN(LTRIM(RTRIM(Nombre)))>0),
 CONSTRAINT CK_ProductosBase_Formula CHECK(FormulaDeclarada IS NULL OR LEN(LTRIM(RTRIM(FormulaDeclarada)))>0)
);
CREATE INDEX IX_ProductosBase_Nombre ON dbo.ProductosBase(Nombre);

INSERT dbo.Marcas(Nombre)
SELECT MIN(LTRIM(RTRIM(Marca))) FROM dbo.Productos
WHERE NULLIF(LTRIM(RTRIM(Marca)),N'') IS NOT NULL GROUP BY UPPER(LTRIM(RTRIM(Marca)));
INSERT dbo.ProductosBase(Codigo,Nombre,Descripcion)
SELECT N'BASE-'+CONVERT(nvarchar(20),IdProducto),Nombre,
 N'Migrado del catalogo anterior. Agrupacion y comparabilidad pendientes de revision.' FROM dbo.Productos;

CREATE SEQUENCE dbo.SecCodigoProducto AS bigint START WITH 1 INCREMENT BY 1;
ALTER TABLE dbo.Productos ADD CodigoInterno nvarchar(40) NULL,IdProductoBase int NULL,IdMarca int NULL;
GO
UPDATE p SET CodigoInterno=N'PRD-'+CONVERT(nvarchar(20),NEXT VALUE FOR dbo.SecCodigoProducto),
 IdProductoBase=b.IdProductoBase,IdMarca=m.IdMarca
FROM dbo.Productos p JOIN dbo.ProductosBase b ON b.Codigo=N'BASE-'+CONVERT(nvarchar(20),p.IdProducto)
LEFT JOIN dbo.Marcas m ON m.NombreNormalizado=UPPER(LTRIM(RTRIM(p.Marca)));
ALTER TABLE dbo.Productos ALTER COLUMN CodigoInterno nvarchar(40) NOT NULL;
ALTER TABLE dbo.Productos ALTER COLUMN IdProductoBase int NOT NULL;
ALTER TABLE dbo.Productos ADD CONSTRAINT DF_Productos_CodigoInterno DEFAULT(N'PRD-'+CONVERT(nvarchar(20),NEXT VALUE FOR dbo.SecCodigoProducto)) FOR CodigoInterno;
ALTER TABLE dbo.Productos DROP CONSTRAINT UQ_Productos_Nombre;
ALTER TABLE dbo.Productos WITH CHECK ADD
 CONSTRAINT UQ_Productos_CodigoInterno UNIQUE(CodigoInterno),
 CONSTRAINT FK_Productos_ProductosBase FOREIGN KEY(IdProductoBase) REFERENCES dbo.ProductosBase(IdProductoBase),
 CONSTRAINT FK_Productos_Marcas FOREIGN KEY(IdMarca) REFERENCES dbo.Marcas(IdMarca),
 CONSTRAINT CK_Productos_NombreCodigo CHECK(LEN(LTRIM(RTRIM(Nombre)))>0 AND LEN(LTRIM(RTRIM(CodigoInterno)))>0);
CREATE INDEX IX_Productos_Base_Marca ON dbo.Productos(IdProductoBase,IdMarca) INCLUDE(Nombre,Activo);
CREATE INDEX IX_Productos_IdMarca ON dbo.Productos(IdMarca) WHERE IdMarca IS NOT NULL;
/* Marca permanece como columna de compatibilidad; los triggers mantienen su
   coherencia con IdMarca. El catalogo normalizado es la fuente de referencia. */

ALTER TABLE dbo.Proveedores ADD TipoIdentificacion nvarchar(30) NULL,IdentificacionFiscal nvarchar(50) NULL,PaisIdentificacion char(2) NULL;
GO
ALTER TABLE dbo.Proveedores WITH CHECK ADD CONSTRAINT CK_Proveedores_IdentificacionFiscal CHECK(
 (TipoIdentificacion IS NULL AND IdentificacionFiscal IS NULL AND PaisIdentificacion IS NULL) OR
 (TipoIdentificacion IS NOT NULL AND IdentificacionFiscal IS NOT NULL AND PaisIdentificacion IS NOT NULL
 AND LEN(LTRIM(RTRIM(TipoIdentificacion)))>0 AND LEN(LTRIM(RTRIM(IdentificacionFiscal)))>0
 AND PaisIdentificacion COLLATE Latin1_General_100_BIN2 NOT LIKE '%[^A-Z]%' AND LEN(PaisIdentificacion)=2));
CREATE UNIQUE INDEX UX_Proveedores_IdentificacionFiscal ON dbo.Proveedores(PaisIdentificacion,TipoIdentificacion,IdentificacionFiscal)
 WHERE IdentificacionFiscal IS NOT NULL;

CREATE TABLE dbo.Documentos(
 IdDocumento bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_Documentos PRIMARY KEY,
 NombreOriginal nvarchar(255) NOT NULL,
 RutaAlmacenamiento nvarchar(800) NOT NULL,
 Sha256 binary(32) NOT NULL,
 TamanoBytes bigint NOT NULL,
 TipoContenido varchar(100) NOT NULL CONSTRAINT DF_Documentos_Tipo DEFAULT('application/pdf'),
 Origen varchar(20) NOT NULL,
 VersionPlantilla nvarchar(40) NULL,
 FechaRegistro datetime2(3) NOT NULL CONSTRAINT DF_Documentos_Fecha DEFAULT(SYSUTCDATETIME()),
 CONSTRAINT UQ_Documentos_Ruta UNIQUE(RutaAlmacenamiento),
 CONSTRAINT CK_Documentos_Textos CHECK(LEN(LTRIM(RTRIM(NombreOriginal)))>0 AND LEN(LTRIM(RTRIM(RutaAlmacenamiento)))>0),
 CONSTRAINT CK_Documentos_Tamano CHECK(TamanoBytes>0),
 CONSTRAINT CK_Documentos_Tipo CHECK(TipoContenido='application/pdf'),
 CONSTRAINT CK_Documentos_Origen CHECK(Origen IN('Generado','Recibido')),
 CONSTRAINT CK_Documentos_Plantilla CHECK(VersionPlantilla IS NULL OR LEN(LTRIM(RTRIM(VersionPlantilla)))>0)
);
CREATE INDEX IX_Documentos_Sha256 ON dbo.Documentos(Sha256);
/* El mismo archivo puede adjuntarse en mas de un contexto; el hash no es una
   clave comercial. La ruta corresponde a un archivo administrado e inmutable. */

CREATE TABLE dbo.SolicitudesCotizacion(
 IdSolicitudCotizacion bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_SolicitudesCotizacion PRIMARY KEY,
 NumeroSolicitud nvarchar(50) NOT NULL,
 VersionSolicitud int NOT NULL CONSTRAINT DF_Solicitudes_Version DEFAULT(1),
 IdSolicitudAnterior bigint NULL,
 FechaSolicitud date NOT NULL,
 FechaLimiteRespuesta date NULL,
 Estado varchar(20) NOT NULL CONSTRAINT DF_Solicitudes_Estado DEFAULT('Borrador'),
 DatosClienteOriginalJson nvarchar(max) NULL,
 Observaciones nvarchar(2000) NULL,
 FechaEmision datetime2(3) NULL,
 FechaCreacion datetime2(3) NOT NULL CONSTRAINT DF_Solicitudes_Creacion DEFAULT(SYSUTCDATETIME()),
 FechaModificacion datetime2(3) NULL,
 CONSTRAINT UQ_Solicitudes_NumeroVersion UNIQUE(NumeroSolicitud,VersionSolicitud),
 CONSTRAINT FK_Solicitudes_Anterior FOREIGN KEY(IdSolicitudAnterior) REFERENCES dbo.SolicitudesCotizacion(IdSolicitudCotizacion),
 CONSTRAINT CK_Solicitudes_Numero CHECK(LEN(LTRIM(RTRIM(NumeroSolicitud)))>0),
 CONSTRAINT CK_Solicitudes_Version CHECK(VersionSolicitud>=1 AND (IdSolicitudAnterior IS NULL OR IdSolicitudAnterior<>IdSolicitudCotizacion)),
 CONSTRAINT CK_Solicitudes_Fechas CHECK(FechaLimiteRespuesta IS NULL OR FechaLimiteRespuesta>=FechaSolicitud),
 CONSTRAINT CK_Solicitudes_Estado CHECK(Estado IN('Borrador','Emitida','Cerrada','Cancelada')),
 CONSTRAINT CK_Solicitudes_ClienteJson CHECK(DatosClienteOriginalJson IS NULL OR ISJSON(DatosClienteOriginalJson)=1),
 CONSTRAINT CK_Solicitudes_Emitida CHECK(Estado NOT IN('Emitida','Cerrada') OR (FechaEmision IS NOT NULL AND DatosClienteOriginalJson IS NOT NULL))
);
CREATE INDEX IX_Solicitudes_Estado_Fecha ON dbo.SolicitudesCotizacion(Estado,FechaSolicitud DESC);
CREATE INDEX IX_Solicitudes_Anterior ON dbo.SolicitudesCotizacion(IdSolicitudAnterior) WHERE IdSolicitudAnterior IS NOT NULL;

CREATE TABLE dbo.SolicitudesCotizacionDetalle(
 IdSolicitudCotizacionDetalle bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_SolicitudesDetalle PRIMARY KEY,
 IdSolicitudCotizacion bigint NOT NULL,
 NumeroLinea int NOT NULL,
 IdProducto int NOT NULL,
 IdPresentacionProducto int NOT NULL,
 CantidadEmpaquesSolicitada decimal(18,4) NOT NULL,
 NombreProductoOriginal nvarchar(150) NOT NULL,
 MarcaOriginal nvarchar(150) NULL,
 PresentacionOriginal nvarchar(150) NOT NULL,
 ContenidoEmpaqueOriginal decimal(18,6) NOT NULL,
 IdUnidadMedidaOriginal int NOT NULL,
 CodigoUnidadOriginal nvarchar(20) NOT NULL,
 TipoBaseOriginal nvarchar(20) NOT NULL,
 FactorConversionOriginal decimal(18,6) NOT NULL,
 ContenidoNormalizadoOriginal decimal(18,6) NOT NULL,
 PermiteAlternativas bit NOT NULL CONSTRAINT DF_SolicitudesDetalle_Alternativas DEFAULT(1),
 Observaciones nvarchar(1000) NULL,
 CONSTRAINT UQ_SolicitudesDetalle_Linea UNIQUE(IdSolicitudCotizacion,NumeroLinea),
 CONSTRAINT UQ_SolicitudesDetalle_SolicitudId UNIQUE(IdSolicitudCotizacion,IdSolicitudCotizacionDetalle),
 CONSTRAINT FK_SolicitudesDetalle_Solicitud FOREIGN KEY(IdSolicitudCotizacion) REFERENCES dbo.SolicitudesCotizacion(IdSolicitudCotizacion),
 CONSTRAINT FK_SolicitudesDetalle_Producto FOREIGN KEY(IdProducto) REFERENCES dbo.Productos(IdProducto),
 CONSTRAINT FK_SolicitudesDetalle_PresentacionProducto FOREIGN KEY(IdPresentacionProducto,IdProducto) REFERENCES dbo.PresentacionesProducto(IdPresentacionProducto,IdProducto),
 CONSTRAINT FK_SolicitudesDetalle_Unidad FOREIGN KEY(IdUnidadMedidaOriginal) REFERENCES dbo.UnidadesMedida(IdUnidadMedida),
 CONSTRAINT CK_SolicitudesDetalle_Linea CHECK(NumeroLinea>0),
 CONSTRAINT CK_SolicitudesDetalle_Cantidades CHECK(CantidadEmpaquesSolicitada>0 AND ContenidoEmpaqueOriginal>0 AND FactorConversionOriginal>0 AND ContenidoNormalizadoOriginal>0),
 CONSTRAINT CK_SolicitudesDetalle_Textos CHECK(LEN(LTRIM(RTRIM(NombreProductoOriginal)))>0 AND LEN(LTRIM(RTRIM(PresentacionOriginal)))>0 AND LEN(LTRIM(RTRIM(CodigoUnidadOriginal)))>0),
 CONSTRAINT CK_SolicitudesDetalle_TipoBase CHECK(TipoBaseOriginal IN('PESO','VOLUMEN','UNIDAD')),
 CONSTRAINT CK_SolicitudesDetalle_Normalizada CHECK(ContenidoNormalizadoOriginal=CONVERT(decimal(18,6),ContenidoEmpaqueOriginal*FactorConversionOriginal))
);
CREATE INDEX IX_SolicitudesDetalle_ProductoPresentacion ON dbo.SolicitudesCotizacionDetalle(IdProducto,IdPresentacionProducto);
CREATE INDEX IX_SolicitudesDetalle_Presentacion ON dbo.SolicitudesCotizacionDetalle(IdPresentacionProducto,IdProducto);
CREATE INDEX IX_SolicitudesDetalle_Unidad ON dbo.SolicitudesCotizacionDetalle(IdUnidadMedidaOriginal);

CREATE TABLE dbo.SolicitudesCotizacionProveedor(
 IdSolicitudCotizacionProveedor bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_SolicitudesProveedor PRIMARY KEY,
 IdSolicitudCotizacion bigint NOT NULL,
 IdProveedor int NOT NULL,
 IdDocumentoEnviado bigint NULL,
 Estado varchar(20) NOT NULL CONSTRAINT DF_SolicitudesProveedor_Estado DEFAULT('PendienteEnvio'),
 FechaEnvio datetime2(3) NULL,
 FechaRespuesta datetime2(3) NULL,
 Observaciones nvarchar(1000) NULL,
 CONSTRAINT UQ_SolicitudesProveedor_Destinatario UNIQUE(IdSolicitudCotizacion,IdProveedor),
 CONSTRAINT UQ_SolicitudesProveedor_Identidad UNIQUE(IdSolicitudCotizacionProveedor,IdSolicitudCotizacion,IdProveedor),
 CONSTRAINT FK_SolicitudesProveedor_Solicitud FOREIGN KEY(IdSolicitudCotizacion) REFERENCES dbo.SolicitudesCotizacion(IdSolicitudCotizacion),
 CONSTRAINT FK_SolicitudesProveedor_Proveedor FOREIGN KEY(IdProveedor) REFERENCES dbo.Proveedores(IdProveedor),
 CONSTRAINT FK_SolicitudesProveedor_Documento FOREIGN KEY(IdDocumentoEnviado) REFERENCES dbo.Documentos(IdDocumento),
 CONSTRAINT CK_SolicitudesProveedor_Estado CHECK(Estado IN('PendienteEnvio','Enviada','Respondida','Declinada','Cancelada')),
 CONSTRAINT CK_SolicitudesProveedor_Envio CHECK(Estado NOT IN('Enviada','Respondida') OR (FechaEnvio IS NOT NULL AND IdDocumentoEnviado IS NOT NULL)),
 CONSTRAINT CK_SolicitudesProveedor_Respuesta CHECK(Estado<>'Respondida' OR FechaRespuesta IS NOT NULL),
 CONSTRAINT CK_SolicitudesProveedor_Fechas CHECK(FechaRespuesta IS NULL OR FechaEnvio IS NULL OR FechaRespuesta>=FechaEnvio)
);
CREATE INDEX IX_SolicitudesProveedor_ProveedorEstado ON dbo.SolicitudesCotizacionProveedor(IdProveedor,Estado);
CREATE INDEX IX_SolicitudesProveedor_Documento ON dbo.SolicitudesCotizacionProveedor(IdDocumentoEnviado) WHERE IdDocumentoEnviado IS NOT NULL;

CREATE TABLE dbo.ImportacionesDocumento(
 IdImportacionDocumento bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_ImportacionesDocumento PRIMARY KEY,
 IdDocumento bigint NOT NULL,
 VersionLector nvarchar(50) NOT NULL,
 Metodo varchar(20) NOT NULL,
 Estado varchar(30) NOT NULL,
 DatosExtraidosJson nvarchar(max) NULL,
 AdvertenciasJson nvarchar(max) NULL,
 FechaImportacion datetime2(3) NOT NULL CONSTRAINT DF_ImportacionesDocumento_Fecha DEFAULT(SYSUTCDATETIME()),
 CONSTRAINT UQ_ImportacionesDocumento_Documento UNIQUE(IdImportacionDocumento,IdDocumento),
 CONSTRAINT FK_ImportacionesDocumento_Documento FOREIGN KEY(IdDocumento) REFERENCES dbo.Documentos(IdDocumento),
 CONSTRAINT CK_ImportacionesDocumento_Lector CHECK(LEN(LTRIM(RTRIM(VersionLector)))>0),
 CONSTRAINT CK_ImportacionesDocumento_Metodo CHECK(Metodo IN('AcroForm','Posiciones','Manual')),
 CONSTRAINT CK_ImportacionesDocumento_Estado CHECK(Estado IN('Completada','Parcial','Fallida','NoCompatible')),
 CONSTRAINT CK_ImportacionesDocumento_Datos CHECK(DatosExtraidosJson IS NULL OR ISJSON(DatosExtraidosJson)=1),
 CONSTRAINT CK_ImportacionesDocumento_Advertencias CHECK(AdvertenciasJson IS NULL OR ISJSON(AdvertenciasJson)=1),
 CONSTRAINT CK_ImportacionesDocumento_Completada CHECK(Estado<>'Completada' OR DatosExtraidosJson IS NOT NULL)
);
CREATE INDEX IX_ImportacionesDocumento_DocumentoFecha ON dbo.ImportacionesDocumento(IdDocumento,FechaImportacion DESC);

/* Proformas existentes: vacias en el preflight. Se permiten campos pendientes
   en borrador y se exigen los esenciales cuando se valida una respuesta. */
ALTER TABLE dbo.ProformasProveedor DROP CONSTRAINT UQ_ProformasProveedor_NumeroProveedor,
 CK_ProformasProveedor_Montos_Validos,CK_ProformasProveedor_NumeroProforma_NoVacio,CK_ProformasProveedor_Estado_Valido;
DECLARE @DefaultEstado sysname=(SELECT dc.name FROM sys.default_constraints dc JOIN sys.columns c
 ON c.object_id=dc.parent_object_id AND c.column_id=dc.parent_column_id
 WHERE dc.parent_object_id=OBJECT_ID(N'dbo.ProformasProveedor') AND c.name=N'Estado');
IF @DefaultEstado IS NOT NULL BEGIN
 DECLARE @DropDefaultEstado nvarchar(max)=N'ALTER TABLE dbo.ProformasProveedor DROP CONSTRAINT '+QUOTENAME(@DefaultEstado);
 EXEC sys.sp_executesql @DropDefaultEstado;
END;
ALTER TABLE dbo.ProformasProveedor ALTER COLUMN NumeroProforma nvarchar(50) NULL;
ALTER TABLE dbo.ProformasProveedor ALTER COLUMN TipoDocumento nvarchar(50) NULL;
ALTER TABLE dbo.ProformasProveedor ALTER COLUMN NombreProveedorPdf nvarchar(200) NULL;
ALTER TABLE dbo.ProformasProveedor ALTER COLUMN NombreNegocio nvarchar(250) NULL;
ALTER TABLE dbo.ProformasProveedor ALTER COLUMN RazonSocial nvarchar(250) NULL;
ALTER TABLE dbo.ProformasProveedor ALTER COLUMN Cedula nvarchar(50) NULL;
ALTER TABLE dbo.ProformasProveedor ALTER COLUMN Telefono nvarchar(50) NULL;
ALTER TABLE dbo.ProformasProveedor ALTER COLUMN Vendedor nvarchar(150) NULL;
ALTER TABLE dbo.ProformasProveedor ALTER COLUMN Observaciones nvarchar(2000) NULL;
ALTER TABLE dbo.ProformasProveedor ALTER COLUMN Subtotal decimal(18,4) NULL;
ALTER TABLE dbo.ProformasProveedor ALTER COLUMN Descuento decimal(18,4) NULL;
ALTER TABLE dbo.ProformasProveedor ALTER COLUMN IVA decimal(18,4) NULL;
ALTER TABLE dbo.ProformasProveedor ALTER COLUMN Total decimal(18,4) NULL;
ALTER TABLE dbo.ProformasProveedor ALTER COLUMN Estado varchar(30) NOT NULL;
ALTER TABLE dbo.ProformasProveedor ADD
 IdSolicitudCotizacionProveedor bigint NOT NULL,
 IdSolicitudCotizacion bigint NOT NULL,
 VersionRespuesta int NOT NULL CONSTRAINT DF_Proformas_Version DEFAULT(1),
 IdProformaAnterior int NULL,
 Moneda char(3) NULL,
 IdDocumentoOrigen bigint NULL,
 IdImportacionDocumento bigint NULL,
 DatosProveedorOriginalJson nvarchar(max) NULL,
 DatosClienteOriginalJson nvarchar(max) NULL,
 CondicionesPago nvarchar(1000) NULL,
 CondicionesEntrega nvarchar(1000) NULL,
 OtrosCargos decimal(18,4) NULL,
 EstadoConciliacion varchar(20) NOT NULL CONSTRAINT DF_Proformas_Conciliacion DEFAULT('Pendiente'),
 JustificacionConciliacion nvarchar(1000) NULL,
 FechaValidacion datetime2(3) NULL;
ALTER TABLE dbo.ProformasProveedor ADD CONSTRAINT DF_Proformas_Estado DEFAULT('Borrador') FOR Estado;
DECLARE @DefaultFecha sysname=(SELECT dc.name FROM sys.default_constraints dc JOIN sys.columns c
 ON c.object_id=dc.parent_object_id AND c.column_id=dc.parent_column_id
 WHERE dc.parent_object_id=OBJECT_ID(N'dbo.ProformasProveedor') AND c.name=N'FechaCreacion');
IF @DefaultFecha IS NOT NULL BEGIN
 DECLARE @DropDefaultFecha nvarchar(max)=N'ALTER TABLE dbo.ProformasProveedor DROP CONSTRAINT '+QUOTENAME(@DefaultFecha);
 EXEC sys.sp_executesql @DropDefaultFecha;
END;
ALTER TABLE dbo.ProformasProveedor ALTER COLUMN FechaCreacion datetime2(3) NOT NULL;
ALTER TABLE dbo.ProformasProveedor ALTER COLUMN FechaModificacion datetime2(3) NULL;
ALTER TABLE dbo.ProformasProveedor ADD CONSTRAINT DF_Proformas_Creacion DEFAULT(SYSUTCDATETIME()) FOR FechaCreacion;
GO
ALTER TABLE dbo.ProformasProveedor WITH CHECK ADD
 CONSTRAINT UQ_Proformas_Contexto UNIQUE(IdProformaProveedor,IdSolicitudCotizacion),
 CONSTRAINT UQ_Proformas_VersionSolicitudProveedor UNIQUE(IdSolicitudCotizacionProveedor,VersionRespuesta),
 CONSTRAINT FK_Proformas_SolicitudProveedor FOREIGN KEY(IdSolicitudCotizacionProveedor,IdSolicitudCotizacion,IdProveedor)
 REFERENCES dbo.SolicitudesCotizacionProveedor(IdSolicitudCotizacionProveedor,IdSolicitudCotizacion,IdProveedor),
 CONSTRAINT FK_Proformas_Documento FOREIGN KEY(IdDocumentoOrigen) REFERENCES dbo.Documentos(IdDocumento),
 CONSTRAINT FK_Proformas_ImportacionDocumento FOREIGN KEY(IdImportacionDocumento,IdDocumentoOrigen)
 REFERENCES dbo.ImportacionesDocumento(IdImportacionDocumento,IdDocumento),
 CONSTRAINT FK_Proformas_Anterior FOREIGN KEY(IdProformaAnterior) REFERENCES dbo.ProformasProveedor(IdProformaProveedor),
 CONSTRAINT CK_Proformas_Numero CHECK(NumeroProforma IS NULL OR LEN(LTRIM(RTRIM(NumeroProforma)))>0),
 CONSTRAINT CK_Proformas_Version CHECK(VersionRespuesta>=1 AND (IdProformaAnterior IS NULL OR IdProformaAnterior<>IdProformaProveedor)),
 CONSTRAINT CK_Proformas_Importacion CHECK(IdImportacionDocumento IS NULL OR IdDocumentoOrigen IS NOT NULL),
 CONSTRAINT CK_Proformas_Moneda CHECK(Moneda IS NULL OR (LEN(Moneda)=3 AND Moneda COLLATE Latin1_General_100_BIN2 NOT LIKE '%[^A-Z]%')),
 CONSTRAINT CK_Proformas_Montos CHECK((Subtotal IS NULL OR Subtotal>=0) AND (Descuento IS NULL OR Descuento>=0)
 AND (IVA IS NULL OR IVA>=0) AND (Total IS NULL OR Total>=0) AND (OtrosCargos IS NULL OR OtrosCargos>=0)),
 CONSTRAINT CK_Proformas_Estado CHECK(Estado IN('Borrador','EnRevision','Validada','Cancelada','Reemplazada')),
 CONSTRAINT CK_Proformas_Conciliacion CHECK(EstadoConciliacion IN('Pendiente','Conciliada','ConDiferencias')),
 CONSTRAINT CK_Proformas_ConciliacionMotivo CHECK(EstadoConciliacion<>'ConDiferencias' OR
 (JustificacionConciliacion IS NOT NULL AND LEN(LTRIM(RTRIM(JustificacionConciliacion)))>0)),
 CONSTRAINT CK_Proformas_ProveedorJson CHECK(DatosProveedorOriginalJson IS NULL OR ISJSON(DatosProveedorOriginalJson)=1),
 CONSTRAINT CK_Proformas_ClienteJson CHECK(DatosClienteOriginalJson IS NULL OR ISJSON(DatosClienteOriginalJson)=1),
 CONSTRAINT CK_Proformas_Validada CHECK(Estado NOT IN('Validada','Reemplazada') OR
 (Moneda IS NOT NULL AND IdDocumentoOrigen IS NOT NULL AND FechaValidacion IS NOT NULL AND FechaProforma IS NOT NULL
 AND Subtotal IS NOT NULL AND Descuento IS NOT NULL AND IVA IS NOT NULL AND Total IS NOT NULL AND OtrosCargos IS NOT NULL
 AND DatosProveedorOriginalJson IS NOT NULL AND DatosClienteOriginalJson IS NOT NULL AND EstadoConciliacion<>'Pendiente'));
CREATE UNIQUE INDEX UX_Proformas_NumeroProveedorVersion ON dbo.ProformasProveedor(IdProveedor,NumeroProforma,VersionRespuesta) WHERE NumeroProforma IS NOT NULL;
CREATE INDEX IX_Proformas_SolicitudEstado ON dbo.ProformasProveedor(IdSolicitudCotizacion,Estado) INCLUDE(IdProveedor,Moneda,Total);
CREATE INDEX IX_Proformas_Documento ON dbo.ProformasProveedor(IdDocumentoOrigen) WHERE IdDocumentoOrigen IS NOT NULL;
CREATE INDEX IX_Proformas_Importacion ON dbo.ProformasProveedor(IdImportacionDocumento,IdDocumentoOrigen) WHERE IdImportacionDocumento IS NOT NULL;
CREATE INDEX IX_Proformas_Anterior ON dbo.ProformasProveedor(IdProformaAnterior) WHERE IdProformaAnterior IS NOT NULL;

ALTER TABLE dbo.ProformasProveedorDetalle DROP CONSTRAINT CK_ProformasProveedorDetalle_Cantidad_MayorCero,
 CK_ProformasProveedorDetalle_PrecioUnitario_MayorCero,CK_ProformasProveedorDetalle_TotalLinea_MayorCero;
ALTER TABLE dbo.ProformasProveedorDetalle ALTER COLUMN CodigoProveedor nvarchar(100) NULL;
ALTER TABLE dbo.ProformasProveedorDetalle ALTER COLUMN DescripcionProveedor nvarchar(500) NULL;
ALTER TABLE dbo.ProformasProveedorDetalle ALTER COLUMN ObservacionValidacion nvarchar(1000) NULL;
ALTER TABLE dbo.ProformasProveedorDetalle ALTER COLUMN Cantidad decimal(18,4) NULL;
ALTER TABLE dbo.ProformasProveedorDetalle ALTER COLUMN PrecioUnitario decimal(18,6) NULL;
ALTER TABLE dbo.ProformasProveedorDetalle ALTER COLUMN TotalLinea decimal(18,4) NULL;
DECLARE @DefaultFechaDetalle sysname=(SELECT dc.name FROM sys.default_constraints dc JOIN sys.columns c
 ON c.object_id=dc.parent_object_id AND c.column_id=dc.parent_column_id
 WHERE dc.parent_object_id=OBJECT_ID(N'dbo.ProformasProveedorDetalle') AND c.name=N'FechaCreacion');
IF @DefaultFechaDetalle IS NOT NULL BEGIN
 DECLARE @DropDefaultFechaDetalle nvarchar(max)=N'ALTER TABLE dbo.ProformasProveedorDetalle DROP CONSTRAINT '+QUOTENAME(@DefaultFechaDetalle);
 EXEC sys.sp_executesql @DropDefaultFechaDetalle;
END;
ALTER TABLE dbo.ProformasProveedorDetalle ALTER COLUMN FechaCreacion datetime2(3) NOT NULL;
ALTER TABLE dbo.ProformasProveedorDetalle ALTER COLUMN FechaModificacion datetime2(3) NULL;
ALTER TABLE dbo.ProformasProveedorDetalle ADD CONSTRAINT DF_ProformasDetalle_Creacion DEFAULT(SYSUTCDATETIME()) FOR FechaCreacion;
ALTER TABLE dbo.ProformasProveedorDetalle ADD
 IdSolicitudCotizacion bigint NOT NULL,
 IdSolicitudCotizacionDetalle bigint NULL,
 NumeroLineaDocumento int NULL,
 TipoOferta varchar(20) NOT NULL CONSTRAINT DF_ProformasDetalle_Tipo DEFAULT('Solicitada'),
 EstadoOferta varchar(20) NOT NULL CONSTRAINT DF_ProformasDetalle_Oferta DEFAULT('Cotizada'),
 EstadoRevision varchar(20) NOT NULL CONSTRAINT DF_ProformasDetalle_Revision DEFAULT('Pendiente'),
 NombreProductoOriginal nvarchar(150) NULL,
 MarcaOriginal nvarchar(150) NULL,
 PresentacionOriginal nvarchar(150) NULL,
 ContenidoEmpaqueOriginal decimal(18,6) NULL,
 IdUnidadMedidaOriginal int NULL,
 CodigoUnidadOriginal nvarchar(20) NULL,
 TipoBaseOriginal nvarchar(20) NULL,
 FactorConversionOriginal decimal(18,6) NULL,
 ContenidoNormalizadoOriginal decimal(18,6) NULL,
 DescuentoMonto decimal(18,4) NULL,
 ImpuestoMonto decimal(18,4) NULL,
 BaseTotalLinea varchar(30) NOT NULL CONSTRAINT DF_ProformasDetalle_BaseTotal DEFAULT('SinDefinir'),
 MotivoAlternativa nvarchar(1000) NULL;
GO
ALTER TABLE dbo.ProformasProveedorDetalle WITH CHECK ADD
 CONSTRAINT UQ_ProformasDetalle_Identidad UNIQUE(IdProformaProveedor,IdProformaProveedorDetalle),
 CONSTRAINT FK_ProformasDetalle_Contexto FOREIGN KEY(IdProformaProveedor,IdSolicitudCotizacion)
 REFERENCES dbo.ProformasProveedor(IdProformaProveedor,IdSolicitudCotizacion),
 CONSTRAINT FK_ProformasDetalle_SolicitudLinea FOREIGN KEY(IdSolicitudCotizacion,IdSolicitudCotizacionDetalle)
 REFERENCES dbo.SolicitudesCotizacionDetalle(IdSolicitudCotizacion,IdSolicitudCotizacionDetalle),
 CONSTRAINT FK_ProformasDetalle_UnidadOriginal FOREIGN KEY(IdUnidadMedidaOriginal) REFERENCES dbo.UnidadesMedida(IdUnidadMedida),
 CONSTRAINT CK_ProformasDetalle_NumeroLinea CHECK(NumeroLineaDocumento IS NULL OR NumeroLineaDocumento>0),
 CONSTRAINT CK_ProformasDetalle_Tipo CHECK(TipoOferta IN('Solicitada','Alternativa','Adicional') AND (TipoOferta<>'Adicional' OR IdSolicitudCotizacionDetalle IS NULL)),
 CONSTRAINT CK_ProformasDetalle_Oferta CHECK(EstadoOferta IN('Cotizada','NoDisponible','SinCotizar')),
 CONSTRAINT CK_ProformasDetalle_Revision CHECK(EstadoRevision IN('Pendiente','Revisada')),
 CONSTRAINT CK_ProformasDetalle_Cantidades CHECK((Cantidad IS NULL OR Cantidad>0) AND
 (ContenidoEmpaqueOriginal IS NULL OR ContenidoEmpaqueOriginal>0) AND
 (FactorConversionOriginal IS NULL OR FactorConversionOriginal>0) AND
 (ContenidoNormalizadoOriginal IS NULL OR ContenidoNormalizadoOriginal>0)),
 CONSTRAINT CK_ProformasDetalle_Importes CHECK((PrecioUnitario IS NULL OR PrecioUnitario>=0) AND
 (TotalLinea IS NULL OR TotalLinea>=0) AND (DescuentoMonto IS NULL OR DescuentoMonto>=0) AND (ImpuestoMonto IS NULL OR ImpuestoMonto>=0)),
 CONSTRAINT CK_ProformasDetalle_TipoBase CHECK(TipoBaseOriginal IS NULL OR TipoBaseOriginal IN('PESO','VOLUMEN','UNIDAD')),
 CONSTRAINT CK_ProformasDetalle_BaseTotal CHECK(BaseTotalLinea IN('SinDefinir','Bruto','NetoSinImpuestos','ConImpuestos')),
 CONSTRAINT CK_ProformasDetalle_PresentacionProducto CHECK(IdPresentacionProducto IS NULL OR IdProducto IS NOT NULL),
 CONSTRAINT CK_ProformasDetalle_Textos CHECK((DescripcionProveedor IS NULL OR LEN(LTRIM(RTRIM(DescripcionProveedor)))>0)
 AND (NombreProductoOriginal IS NULL OR LEN(LTRIM(RTRIM(NombreProductoOriginal)))>0)
 AND (PresentacionOriginal IS NULL OR LEN(LTRIM(RTRIM(PresentacionOriginal)))>0)
 AND (CodigoUnidadOriginal IS NULL OR LEN(LTRIM(RTRIM(CodigoUnidadOriginal)))>0)),
 CONSTRAINT CK_ProformasDetalle_Normalizada CHECK(ContenidoNormalizadoOriginal IS NULL OR
 (ContenidoEmpaqueOriginal IS NOT NULL AND FactorConversionOriginal IS NOT NULL AND
 ContenidoNormalizadoOriginal=CONVERT(decimal(18,6),ContenidoEmpaqueOriginal*FactorConversionOriginal))),
 CONSTRAINT CK_ProformasDetalle_SinOferta CHECK(EstadoOferta='Cotizada' OR
 (PrecioUnitario IS NULL AND TotalLinea IS NULL AND DescuentoMonto IS NULL AND ImpuestoMonto IS NULL)),
 CONSTRAINT CK_ProformasDetalle_Revisada CHECK(EstadoRevision<>'Revisada' OR
 ((TipoOferta='Adicional' OR IdSolicitudCotizacionDetalle IS NOT NULL) AND
 (EstadoOferta<>'Cotizada' OR (Cantidad IS NOT NULL AND PrecioUnitario IS NOT NULL AND TotalLinea IS NOT NULL
 AND DescripcionProveedor IS NOT NULL AND NumeroLineaDocumento IS NOT NULL AND IdProducto IS NOT NULL AND IdPresentacionProducto IS NOT NULL
 AND NombreProductoOriginal IS NOT NULL AND PresentacionOriginal IS NOT NULL AND ContenidoEmpaqueOriginal IS NOT NULL
 AND IdUnidadMedidaOriginal IS NOT NULL AND CodigoUnidadOriginal IS NOT NULL AND TipoBaseOriginal IS NOT NULL
 AND FactorConversionOriginal IS NOT NULL AND ContenidoNormalizadoOriginal IS NOT NULL AND BaseTotalLinea<>'SinDefinir')))),
 CONSTRAINT CK_ProformasDetalle_Alternativa CHECK(TipoOferta<>'Alternativa' OR EstadoRevision<>'Revisada' OR
 (MotivoAlternativa IS NOT NULL AND LEN(LTRIM(RTRIM(MotivoAlternativa)))>0));
CREATE UNIQUE INDEX UX_ProformasDetalle_NumeroLinea ON dbo.ProformasProveedorDetalle(IdProformaProveedor,NumeroLineaDocumento) WHERE NumeroLineaDocumento IS NOT NULL;
CREATE INDEX IX_ProformasDetalle_Cabecera ON dbo.ProformasProveedorDetalle(IdProformaProveedor,IdProformaProveedorDetalle);
CREATE INDEX IX_ProformasDetalle_SolicitudLinea ON dbo.ProformasProveedorDetalle(IdSolicitudCotizacion,IdSolicitudCotizacionDetalle);
CREATE INDEX IX_ProformasDetalle_ProductoPresentacion ON dbo.ProformasProveedorDetalle(IdProducto,IdPresentacionProducto) WHERE IdProducto IS NOT NULL;
CREATE INDEX IX_ProformasDetalle_PresentacionProducto ON dbo.ProformasProveedorDetalle(IdPresentacionProducto,IdProducto) WHERE IdPresentacionProducto IS NOT NULL;
CREATE INDEX IX_ProformasDetalle_Unidad ON dbo.ProformasProveedorDetalle(IdUnidadMedidaOriginal) WHERE IdUnidadMedidaOriginal IS NOT NULL;

ALTER TABLE dbo.CompraAutomaticaEquivalencias ALTER COLUMN IdProveedor int NOT NULL;
ALTER TABLE dbo.CompraAutomaticaEquivalencias ADD CodigoNormalizado AS NULLIF(UPPER(LTRIM(RTRIM(CodigoProveedor))),N'') PERSISTED;
GO
ALTER TABLE dbo.CompraAutomaticaEquivalencias WITH CHECK ADD
 CONSTRAINT FK_Equivalencias_PresentacionProducto FOREIGN KEY(IdPresentacionProducto,IdProducto)
 REFERENCES dbo.PresentacionesProducto(IdPresentacionProducto,IdProducto),
 CONSTRAINT CK_Equivalencias_Descripcion CHECK(LEN(LTRIM(RTRIM(DescripcionProveedor)))>0),
 CONSTRAINT CK_Equivalencias_Codigo CHECK(CodigoProveedor IS NULL OR LEN(LTRIM(RTRIM(CodigoProveedor)))>0);
CREATE UNIQUE INDEX UX_Equivalencias_ProveedorCodigoActivo ON dbo.CompraAutomaticaEquivalencias(IdProveedor,CodigoNormalizado)
 WHERE Activo=1 AND CodigoProveedor IS NOT NULL;
CREATE INDEX IX_Equivalencias_ProveedorDescripcion ON dbo.CompraAutomaticaEquivalencias(IdProveedor,DescripcionProveedor) INCLUDE(IdProducto,IdPresentacionProducto,Activo);
CREATE INDEX IX_Equivalencias_ProductoPresentacion ON dbo.CompraAutomaticaEquivalencias(IdProducto,IdPresentacionProducto);
CREATE INDEX IX_Equivalencias_PresentacionProducto ON dbo.CompraAutomaticaEquivalencias(IdPresentacionProducto,IdProducto) WHERE IdPresentacionProducto IS NOT NULL;

CREATE TABLE dbo.CambiosCotizacion(
 IdCambioCotizacion bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_CambiosCotizacion PRIMARY KEY,
 IdProformaProveedor int NOT NULL,
 IdProformaProveedorDetalle int NULL,
 Origen varchar(20) NOT NULL,
 CambiosJson nvarchar(max) NOT NULL,
 Motivo nvarchar(1000) NULL,
 Responsable nvarchar(150) NOT NULL CONSTRAINT DF_Cambios_Responsable DEFAULT(ORIGINAL_LOGIN()),
 FechaCambio datetime2(3) NOT NULL CONSTRAINT DF_Cambios_Fecha DEFAULT(SYSUTCDATETIME()),
 CONSTRAINT FK_Cambios_Proforma FOREIGN KEY(IdProformaProveedor) REFERENCES dbo.ProformasProveedor(IdProformaProveedor),
 CONSTRAINT FK_Cambios_Detalle FOREIGN KEY(IdProformaProveedor,IdProformaProveedorDetalle)
 REFERENCES dbo.ProformasProveedorDetalle(IdProformaProveedor,IdProformaProveedorDetalle),
 CONSTRAINT CK_Cambios_Origen CHECK(Origen IN('BaseDatos','Manual','Importacion')),
 CONSTRAINT CK_Cambios_Json CHECK(ISJSON(CambiosJson)=1),
 CONSTRAINT CK_Cambios_Responsable CHECK(LEN(LTRIM(RTRIM(Responsable)))>0)
);
CREATE INDEX IX_Cambios_ProformaFecha ON dbo.CambiosCotizacion(IdProformaProveedor,FechaCambio DESC);
CREATE INDEX IX_Cambios_Detalle ON dbo.CambiosCotizacion(IdProformaProveedor,IdProformaProveedorDetalle) WHERE IdProformaProveedorDetalle IS NOT NULL;
GO
GO
