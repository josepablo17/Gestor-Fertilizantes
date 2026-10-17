
CREATE   PROCEDURE dbo.usp_Solicitud_ObtenerPorId @IdSolicitudCotizacion bigint AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacion WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion) THROW 52004,N'Solicitud no existe.',1;
 SELECT * FROM dbo.SolicitudesCotizacion WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion;
 SELECT * FROM dbo.SolicitudesCotizacionDetalle WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion ORDER BY NumeroLinea;
 SELECT sp.*,p.Nombre AS NombreProveedor,(SELECT COUNT(*) FROM dbo.ProformasProveedor q WHERE q.IdSolicitudCotizacionProveedor=sp.IdSolicitudCotizacionProveedor) AS CantidadRespuestas
 FROM dbo.SolicitudesCotizacionProveedor sp JOIN dbo.Proveedores p ON p.IdProveedor=sp.IdProveedor WHERE sp.IdSolicitudCotizacion=@IdSolicitudCotizacion ORDER BY sp.IdSolicitudCotizacionProveedor;
END;

GO
