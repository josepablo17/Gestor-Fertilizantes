CREATE OR ALTER PROCEDURE dbo.usp_Documento_Registrar
 @NombreOriginal nvarchar(255),@RutaAlmacenamiento nvarchar(800),@Sha256 varbinary(max),@TamanoBytes bigint,
 @Origen varchar(20),@VersionPlantilla nvarchar(40)=NULL,@IdDocumento bigint OUTPUT
AS
BEGIN
 SET NOCOUNT ON;
 IF @Sha256 IS NULL OR DATALENGTH(@Sha256)<>32 THROW 52000,N'SHA-256 debe contener exactamente 32 bytes.',1;
 IF NULLIF(LTRIM(RTRIM(@NombreOriginal)),N'') IS NULL OR NULLIF(LTRIM(RTRIM(@RutaAlmacenamiento)),N'') IS NULL
  THROW 52000,N'Nombre y ruta del archivo son obligatorios.',1;
 IF @TamanoBytes IS NULL OR @TamanoBytes<=0 OR @Origen IS NULL OR @Origen NOT IN('Generado','Recibido')
  THROW 52000,N'Tamano u origen de documento invalido.',1;
 INSERT dbo.Documentos(NombreOriginal,RutaAlmacenamiento,Sha256,TamanoBytes,Origen,VersionPlantilla)
 VALUES(LTRIM(RTRIM(@NombreOriginal)),LTRIM(RTRIM(@RutaAlmacenamiento)),CONVERT(binary(32),@Sha256),@TamanoBytes,@Origen,NULLIF(LTRIM(RTRIM(@VersionPlantilla)),N''));
 SET @IdDocumento=CONVERT(bigint,SCOPE_IDENTITY());
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Documento_ObtenerPorId @IdDocumento bigint AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Documentos WHERE IdDocumento=@IdDocumento) THROW 52004,N'Documento no existe.',1;
 SELECT * FROM dbo.Documentos WHERE IdDocumento=@IdDocumento;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Importacion_Registrar
 @IdDocumento bigint,@VersionLector nvarchar(50),@Metodo varchar(20),@Estado varchar(30),
 @DatosExtraidosJson nvarchar(max)=NULL,@AdvertenciasJson nvarchar(max)=NULL,@IdImportacionDocumento bigint OUTPUT
AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Documentos WHERE IdDocumento=@IdDocumento AND Origen='Recibido')
 THROW 52000,N'La importacion requiere un PDF recibido registrado.',1;
 IF NULLIF(LTRIM(RTRIM(@VersionLector)),N'') IS NULL THROW 52000,N'Version del lector obligatoria.',1;
 IF @DatosExtraidosJson IS NOT NULL AND ISJSON(@DatosExtraidosJson)<>1 THROW 52000,N'Datos de extraccion JSON invalidos.',1;
 IF @AdvertenciasJson IS NOT NULL AND ISJSON(@AdvertenciasJson)<>1 THROW 52000,N'Advertencias JSON invalidas.',1;
 INSERT dbo.ImportacionesDocumento(IdDocumento,VersionLector,Metodo,Estado,DatosExtraidosJson,AdvertenciasJson)
 VALUES(@IdDocumento,@VersionLector,@Metodo,@Estado,@DatosExtraidosJson,@AdvertenciasJson);
 SET @IdImportacionDocumento=CONVERT(bigint,SCOPE_IDENTITY());
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Importacion_ListarPorDocumento @IdDocumento bigint AS
BEGIN
 SET NOCOUNT ON;
 SELECT * FROM dbo.ImportacionesDocumento WHERE IdDocumento=@IdDocumento ORDER BY FechaImportacion DESC,IdImportacionDocumento DESC;
END;
GO
/* Guardado completo del borrador. Los IDs de linea quedan definitivos al emitir.
   Guardar otra vez un borrador reemplaza sus lineas/destinatarios atomicamente. */
CREATE OR ALTER PROCEDURE dbo.usp_Solicitud_GuardarBorrador
 @NumeroSolicitud nvarchar(50),@FechaSolicitud date,@FechaLimiteRespuesta date=NULL,
 @DatosClienteOriginalJson nvarchar(max)=NULL,@Observaciones nvarchar(2000)=NULL,
 @LineasJson nvarchar(max),@ProveedoresJson nvarchar(max),@IdSolicitudCotizacion bigint OUTPUT
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF NULLIF(LTRIM(RTRIM(@NumeroSolicitud)),N'') IS NULL OR @FechaSolicitud IS NULL THROW 52000,N'Numero y fecha de solicitud obligatorios.',1;
 IF ISNULL(ISJSON(@LineasJson,ARRAY),0)<>1 OR ISNULL(ISJSON(@ProveedoresJson,ARRAY),0)<>1 THROW 52000,N'Lineas y proveedores deben ser arreglos JSON.',1;
 IF EXISTS(SELECT 1 FROM OPENJSON(@LineasJson) WHERE [type]<>5) THROW 52000,N'Cada linea debe ser un objeto.',1;
 IF EXISTS(SELECT 1 FROM OPENJSON(@ProveedoresJson) WHERE [type]<>2 OR TRY_CONVERT(int,[value]) IS NULL) THROW 52000,N'Proveedores debe contener IDs enteros.',1;
 DECLARE @Propiedades table(Linea int,Clave nvarchar(4000) COLLATE Latin1_General_100_BIN2,Valor nvarchar(max),Tipo int);
 INSERT @Propiedades SELECT CONVERT(int,j.[key]),v.[key],v.[value],v.[type] FROM OPENJSON(@LineasJson)j CROSS APPLY OPENJSON(j.[value])v;
 IF EXISTS(SELECT Linea,Clave FROM @Propiedades GROUP BY Linea,Clave HAVING COUNT(*)>1)
 OR EXISTS(SELECT 1 FROM @Propiedades WHERE Clave NOT IN(N'numeroLinea',N'idProducto',N'idPresentacionProducto',N'cantidadEmpaques',N'permiteAlternativas',N'observaciones'))
 THROW 52000,N'Propiedad duplicada o desconocida en lineas de solicitud.',1;
 IF EXISTS(SELECT 1 FROM @Propiedades WHERE Clave=N'cantidadEmpaques' AND (Tipo NOT IN(1,2) OR TRY_CONVERT(decimal(18,4),Valor) IS NULL
 OR TRY_CONVERT(decimal(38,18),Valor)<>TRY_CONVERT(decimal(18,4),Valor)
 OR (CHARINDEX(N'.',Valor)>0 AND SUBSTRING(Valor,CHARINDEX(N'.',Valor)+5,4000) LIKE N'%[^0]%')))
 THROW 52000,N'Cantidad de empaques fuera de la precision decimal(18,4).',1;
 IF EXISTS(SELECT 1 FROM @Propiedades WHERE Clave IN(N'numeroLinea',N'idProducto',N'idPresentacionProducto') AND (Tipo NOT IN(1,2) OR TRY_CONVERT(int,Valor) IS NULL OR TRY_CONVERT(int,Valor)<=0))
 OR EXISTS(SELECT 1 FROM @Propiedades WHERE Clave=N'permiteAlternativas' AND Tipo NOT IN(0,3))
 OR EXISTS(SELECT 1 FROM @Propiedades WHERE Clave=N'observaciones' AND Tipo<>0 AND (Tipo<>1 OR DATALENGTH(Valor)>2000))
 THROW 52000,N'Tipos, identificadores o longitud invalidos en lineas de solicitud.',1;
 DECLARE @L table(NumeroLinea int,IdProducto int,IdPresentacion int,Cantidad decimal(18,4),PermiteAlternativas bit,Observaciones nvarchar(1000));
 INSERT @L SELECT NumeroLinea,IdProducto,IdPresentacion,Cantidad,COALESCE(PermiteAlternativas,1),Observaciones
 FROM OPENJSON(@LineasJson) WITH(NumeroLinea int '$.numeroLinea',IdProducto int '$.idProducto',IdPresentacion int '$.idPresentacionProducto',
 Cantidad decimal(18,4) '$.cantidadEmpaques',PermiteAlternativas bit '$.permiteAlternativas',Observaciones nvarchar(1000) '$.observaciones');
 IF EXISTS(SELECT 1 FROM @L WHERE NumeroLinea IS NULL OR NumeroLinea<=0 OR IdProducto IS NULL OR IdPresentacion IS NULL OR Cantidad IS NULL OR Cantidad<=0)
 THROW 52000,N'Lineas con identificacion o cantidades incompletas.',1;
 IF EXISTS(SELECT NumeroLinea FROM @L GROUP BY NumeroLinea HAVING COUNT(*)>1) THROW 52009,N'Numero de linea repetido.',1;
 IF EXISTS(SELECT [value] FROM OPENJSON(@ProveedoresJson) GROUP BY [value] HAVING COUNT(*)>1) THROW 52009,N'Proveedor repetido.',1;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION GuardarSolicitud;
 BEGIN TRY
  IF EXISTS(SELECT 1 FROM @L l LEFT JOIN dbo.PresentacionesProducto pp WITH(HOLDLOCK) ON pp.IdPresentacionProducto=l.IdPresentacion AND pp.IdProducto=l.IdProducto
  LEFT JOIN dbo.Productos p WITH(HOLDLOCK) ON p.IdProducto=l.IdProducto LEFT JOIN dbo.ProductosBase b WITH(HOLDLOCK) ON b.IdProductoBase=p.IdProductoBase
  LEFT JOIN dbo.Marcas m WITH(HOLDLOCK) ON m.IdMarca=p.IdMarca LEFT JOIN dbo.UnidadesMedida u WITH(HOLDLOCK) ON u.IdUnidadMedida=pp.IdUnidadMedida
  WHERE pp.IdPresentacionProducto IS NULL OR p.Activo<>1 OR b.Activo<>1 OR pp.Activo<>1 OR u.Activo<>1 OR (p.IdMarca IS NOT NULL AND m.Activo<>1))
  THROW 52000,N'Las lineas deben usar productos, presentaciones y unidades activos y relacionados.',1;
  IF EXISTS(SELECT 1 FROM OPENJSON(@ProveedoresJson) j LEFT JOIN dbo.Proveedores p WITH(HOLDLOCK) ON p.IdProveedor=TRY_CONVERT(int,j.[value]) WHERE p.IdProveedor IS NULL OR p.Activo<>1)
  THROW 52000,N'Proveedor inexistente o inactivo.',1;
  IF @IdSolicitudCotizacion IS NULL
  BEGIN
   INSERT dbo.SolicitudesCotizacion(NumeroSolicitud,FechaSolicitud,FechaLimiteRespuesta,DatosClienteOriginalJson,Observaciones)
   VALUES(LTRIM(RTRIM(@NumeroSolicitud)),@FechaSolicitud,@FechaLimiteRespuesta,@DatosClienteOriginalJson,@Observaciones);
   SET @IdSolicitudCotizacion=CONVERT(bigint,SCOPE_IDENTITY());
  END ELSE BEGIN
   IF NOT EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacion WITH(UPDLOCK,HOLDLOCK) WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion AND Estado='Borrador')
   THROW 52010,N'La solicitud no existe o ya no admite cambios de borrador.',1;
   IF EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacion WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion AND VersionSolicitud>1 AND NumeroSolicitud<>@NumeroSolicitud)
   THROW 52010,N'Una revision conserva el numero de su cadena.',1;
   UPDATE dbo.SolicitudesCotizacion SET NumeroSolicitud=LTRIM(RTRIM(@NumeroSolicitud)),FechaSolicitud=@FechaSolicitud,FechaLimiteRespuesta=@FechaLimiteRespuesta,
   DatosClienteOriginalJson=@DatosClienteOriginalJson,Observaciones=@Observaciones,FechaModificacion=SYSUTCDATETIME() WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion;
   DELETE dbo.SolicitudesCotizacionDetalle WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion;
   DELETE dbo.SolicitudesCotizacionProveedor WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion;
  END;
  INSERT dbo.SolicitudesCotizacionDetalle(IdSolicitudCotizacion,NumeroLinea,IdProducto,IdPresentacionProducto,CantidadEmpaquesSolicitada,
   NombreProductoOriginal,MarcaOriginal,PresentacionOriginal,ContenidoEmpaqueOriginal,IdUnidadMedidaOriginal,CodigoUnidadOriginal,TipoBaseOriginal,
   FactorConversionOriginal,ContenidoNormalizadoOriginal,PermiteAlternativas,Observaciones)
  SELECT @IdSolicitudCotizacion,l.NumeroLinea,p.IdProducto,pp.IdPresentacionProducto,l.Cantidad,p.Nombre,m.Nombre,pp.Descripcion,pp.Cantidad,
   u.IdUnidadMedida,u.Codigo,u.TipoBase,u.FactorConversion,pp.CantidadNormalizada,l.PermiteAlternativas,l.Observaciones
  FROM @L l JOIN dbo.Productos p ON p.IdProducto=l.IdProducto LEFT JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca
  JOIN dbo.PresentacionesProducto pp ON pp.IdPresentacionProducto=l.IdPresentacion JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=pp.IdUnidadMedida;
  INSERT dbo.SolicitudesCotizacionProveedor(IdSolicitudCotizacion,IdProveedor)SELECT @IdSolicitudCotizacion,CONVERT(int,[value]) FROM OPENJSON(@ProveedoresJson);
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK; ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION GuardarSolicitud;
  THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Solicitud_Listar
 @Estado varchar(20)=NULL,@Buscar nvarchar(50)=NULL,@Pagina int=1,@TamanoPagina int=50
AS
BEGIN
 SET NOCOUNT ON;
 IF @Pagina IS NULL OR @Pagina<1 OR @TamanoPagina IS NULL OR @TamanoPagina NOT BETWEEN 1 AND 200 THROW 52000,N'Paginacion invalida.',1;
 SELECT s.*,COUNT_BIG(*) OVER() AS TotalRegistros,
 (SELECT COUNT(*) FROM dbo.SolicitudesCotizacionDetalle d WHERE d.IdSolicitudCotizacion=s.IdSolicitudCotizacion) AS CantidadLineas,
 (SELECT COUNT(*) FROM dbo.SolicitudesCotizacionProveedor p WHERE p.IdSolicitudCotizacion=s.IdSolicitudCotizacion) AS CantidadProveedores
 FROM dbo.SolicitudesCotizacion s WHERE (@Estado IS NULL OR s.Estado=@Estado) AND (@Buscar IS NULL OR s.NumeroSolicitud LIKE N'%'+@Buscar+N'%')
 ORDER BY s.FechaCreacion DESC,s.IdSolicitudCotizacion DESC OFFSET CONVERT(bigint,@Pagina-1)*@TamanoPagina ROWS FETCH NEXT @TamanoPagina ROWS ONLY;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Solicitud_ObtenerPorId @IdSolicitudCotizacion bigint AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacion WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion) THROW 52004,N'Solicitud no existe.',1;
 SELECT * FROM dbo.SolicitudesCotizacion WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion;
 SELECT * FROM dbo.SolicitudesCotizacionDetalle WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion ORDER BY NumeroLinea;
 SELECT sp.*,p.Nombre AS NombreProveedor,(SELECT COUNT(*) FROM dbo.ProformasProveedor q WHERE q.IdSolicitudCotizacionProveedor=sp.IdSolicitudCotizacionProveedor) AS CantidadRespuestas
 FROM dbo.SolicitudesCotizacionProveedor sp JOIN dbo.Proveedores p ON p.IdProveedor=sp.IdProveedor WHERE sp.IdSolicitudCotizacion=@IdSolicitudCotizacion ORDER BY sp.IdSolicitudCotizacionProveedor;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Solicitud_CrearRevision @IdSolicitudCotizacion bigint,@IdNuevaSolicitud bigint OUTPUT AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION RevisionSolicitud;
 BEGIN TRY
  DECLARE @Numero nvarchar(50),@Version int;
  SELECT @Numero=NumeroSolicitud,@Version=VersionSolicitud FROM dbo.SolicitudesCotizacion WITH(UPDLOCK,HOLDLOCK)
  WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion AND Estado<>'Borrador';
  IF @Numero IS NULL THROW 52010,N'La revision requiere una solicitud ya emitida o finalizada.',1;
  IF EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacion WITH(UPDLOCK,HOLDLOCK) WHERE NumeroSolicitud=@Numero AND VersionSolicitud>@Version)
  THROW 52009,N'Ya hay una version posterior; use la ultima revision.',1;
  INSERT dbo.SolicitudesCotizacion(NumeroSolicitud,VersionSolicitud,IdSolicitudAnterior,FechaSolicitud,FechaLimiteRespuesta,DatosClienteOriginalJson,Observaciones)
  SELECT NumeroSolicitud,VersionSolicitud+1,IdSolicitudCotizacion,FechaSolicitud,FechaLimiteRespuesta,DatosClienteOriginalJson,Observaciones FROM dbo.SolicitudesCotizacion WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion;
  SET @IdNuevaSolicitud=CONVERT(bigint,SCOPE_IDENTITY());
  INSERT dbo.SolicitudesCotizacionDetalle(IdSolicitudCotizacion,NumeroLinea,IdProducto,IdPresentacionProducto,CantidadEmpaquesSolicitada,
   NombreProductoOriginal,MarcaOriginal,PresentacionOriginal,ContenidoEmpaqueOriginal,IdUnidadMedidaOriginal,CodigoUnidadOriginal,TipoBaseOriginal,
   FactorConversionOriginal,ContenidoNormalizadoOriginal,PermiteAlternativas,Observaciones)
  SELECT @IdNuevaSolicitud,NumeroLinea,IdProducto,IdPresentacionProducto,CantidadEmpaquesSolicitada,NombreProductoOriginal,MarcaOriginal,PresentacionOriginal,
   ContenidoEmpaqueOriginal,IdUnidadMedidaOriginal,CodigoUnidadOriginal,TipoBaseOriginal,FactorConversionOriginal,ContenidoNormalizadoOriginal,PermiteAlternativas,Observaciones
  FROM dbo.SolicitudesCotizacionDetalle WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion;
  INSERT dbo.SolicitudesCotizacionProveedor(IdSolicitudCotizacion,IdProveedor)SELECT @IdNuevaSolicitud,IdProveedor FROM dbo.SolicitudesCotizacionProveedor WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK; ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION RevisionSolicitud;
  THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Solicitud_CambiarEstado @IdSolicitudCotizacion bigint,@Estado varchar(20) AS
BEGIN
 SET NOCOUNT ON;
 IF @Estado IS NULL OR @Estado NOT IN('Cerrada','Cancelada') THROW 52000,N'Use Emitir para emitir; aqui solo cerrar o cancelar.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacion WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion) THROW 52004,N'Solicitud no existe.',1;
 UPDATE dbo.SolicitudesCotizacion SET Estado=@Estado,FechaModificacion=SYSUTCDATETIME() WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Solicitud_RegistrarEnvio
 @IdSolicitudCotizacionProveedor bigint,@IdDocumentoEnviado bigint,@FechaEnvio datetime2(3)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION RegistrarEnvio;
 BEGIN TRY
  DECLARE @DocAnterior bigint,@FechaAnterior datetime2(3);
  IF NOT EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacionProveedor sp WITH(UPDLOCK,HOLDLOCK)
   JOIN dbo.SolicitudesCotizacion s ON s.IdSolicitudCotizacion=sp.IdSolicitudCotizacion AND s.Estado='Emitida'
   JOIN dbo.Proveedores p ON p.IdProveedor=sp.IdProveedor AND p.Activo=1 WHERE sp.IdSolicitudCotizacionProveedor=@IdSolicitudCotizacionProveedor)
  THROW 52010,N'El destinatario requiere una solicitud emitida y un proveedor activo.',1;
  SELECT @DocAnterior=IdDocumentoEnviado,@FechaAnterior=FechaEnvio FROM dbo.SolicitudesCotizacionProveedor WHERE IdSolicitudCotizacionProveedor=@IdSolicitudCotizacionProveedor;
  IF @FechaAnterior IS NOT NULL AND @DocAnterior<>@IdDocumentoEnviado THROW 52009,N'El envio original ya esta registrado con otro documento.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.Documentos WHERE IdDocumento=@IdDocumentoEnviado AND Origen='Generado') THROW 52000,N'PDF de salida inexistente o no generado.',1;
  IF @FechaAnterior IS NULL
   UPDATE dbo.SolicitudesCotizacionProveedor SET IdDocumentoEnviado=@IdDocumentoEnviado,FechaEnvio=COALESCE(@FechaEnvio,SYSUTCDATETIME()),Estado='Enviada'
   WHERE IdSolicitudCotizacionProveedor=@IdSolicitudCotizacionProveedor;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK; ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION RegistrarEnvio;
  THROW;
 END CATCH;
END;
GO
