
CREATE   PROCEDURE dbo.usp_Solicitud_CambiarEstado @IdSolicitudCotizacion bigint,@Estado varchar(20) AS
BEGIN
 SET NOCOUNT ON;
 IF @Estado IS NULL OR @Estado NOT IN('Cerrada','Cancelada') THROW 52000,N'Use Emitir para emitir; aqui solo cerrar o cancelar.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacion WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion) THROW 52004,N'Solicitud no existe.',1;
 UPDATE dbo.SolicitudesCotizacion SET Estado=@Estado,FechaModificacion=SYSUTCDATETIME() WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion;
END;

GO
