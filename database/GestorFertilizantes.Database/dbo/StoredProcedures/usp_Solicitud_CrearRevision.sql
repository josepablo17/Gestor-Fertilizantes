
CREATE   PROCEDURE dbo.usp_Solicitud_CrearRevision @IdSolicitudCotizacion bigint,@IdNuevaSolicitud bigint OUTPUT AS
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
