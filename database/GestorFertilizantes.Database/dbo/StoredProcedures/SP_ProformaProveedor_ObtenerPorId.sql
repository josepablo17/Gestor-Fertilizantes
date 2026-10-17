
CREATE   PROCEDURE dbo.SP_ProformaProveedor_ObtenerPorId
 @IdProformaProveedor int
AS
BEGIN
 SET NOCOUNT ON;

 IF NOT EXISTS(SELECT 1 FROM dbo.ProformasProveedor WHERE IdProformaProveedor=@IdProformaProveedor) THROW 52004,N'Cotizacion no existe.',1;
 SELECT p.*,pr.Nombre AS NombreProveedor,s.NumeroSolicitud,s.VersionSolicitud,doc.NombreOriginal AS NombreArchivo,doc.RutaAlmacenamiento,doc.Sha256
 FROM dbo.ProformasProveedor p JOIN dbo.Proveedores pr ON pr.IdProveedor=p.IdProveedor JOIN dbo.SolicitudesCotizacion s ON s.IdSolicitudCotizacion=p.IdSolicitudCotizacion
 LEFT JOIN dbo.Documentos doc ON doc.IdDocumento=p.IdDocumentoOrigen WHERE p.IdProformaProveedor=@IdProformaProveedor;
END;

GO
