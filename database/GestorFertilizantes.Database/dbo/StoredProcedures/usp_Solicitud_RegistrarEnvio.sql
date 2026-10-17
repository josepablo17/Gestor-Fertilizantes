
CREATE   PROCEDURE dbo.usp_Solicitud_RegistrarEnvio
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
