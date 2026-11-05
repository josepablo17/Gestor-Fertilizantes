/* Reserva el PDF original del destinatario sin afirmar que fue enviado. */
CREATE PROCEDURE dbo.usp_Solicitud_AsignarDocumento
 @IdSolicitudCotizacion bigint,@IdSolicitudCotizacionProveedor bigint,@IdDocumento bigint
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION AsignarDocumento;
 BEGIN TRY
  IF NOT EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacion WITH(UPDLOCK,HOLDLOCK)
    WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion AND Estado='Emitida')
   THROW 52010,N'El documento requiere una solicitud emitida.',1;
  DECLARE @Anterior bigint;
  IF NOT EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacionProveedor WITH(UPDLOCK,HOLDLOCK)
    WHERE IdSolicitudCotizacionProveedor=@IdSolicitudCotizacionProveedor AND IdSolicitudCotizacion=@IdSolicitudCotizacion)
   THROW 52004,N'El destinatario no pertenece a la solicitud.',1;
  SELECT @Anterior=IdDocumentoEnviado FROM dbo.SolicitudesCotizacionProveedor
    WHERE IdSolicitudCotizacionProveedor=@IdSolicitudCotizacionProveedor;
  IF @Anterior IS NOT NULL AND @Anterior<>@IdDocumento
   THROW 52009,N'El PDF original ya esta asignado; recupere ese documento.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.Documentos WITH(UPDLOCK,HOLDLOCK)
    WHERE IdDocumento=@IdDocumento AND Origen='Generado' AND VersionPlantilla IS NOT NULL)
   THROW 52000,N'El documento debe ser generado con una version de plantilla.',1;
  IF EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacionProveedor WITH(UPDLOCK,HOLDLOCK)
    WHERE IdDocumentoEnviado=@IdDocumento AND IdSolicitudCotizacionProveedor<>@IdSolicitudCotizacionProveedor)
   THROW 52009,N'El documento ya esta asignado a otro destinatario.',1;
  IF @Anterior IS NULL UPDATE dbo.SolicitudesCotizacionProveedor SET IdDocumentoEnviado=@IdDocumento
    WHERE IdSolicitudCotizacionProveedor=@IdSolicitudCotizacionProveedor;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION AsignarDocumento;
  THROW;
 END CATCH;
END;
