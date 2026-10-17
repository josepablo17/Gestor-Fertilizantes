
/* Guardado completo del borrador. Los IDs de linea quedan definitivos al emitir.
   Guardar otra vez un borrador reemplaza sus lineas/destinatarios atomicamente. */
CREATE   PROCEDURE dbo.usp_Solicitud_GuardarBorrador
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
