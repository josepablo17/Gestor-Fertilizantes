
CREATE   PROCEDURE dbo.SP_ProformaProveedorDetalle_ListarPorProforma
 @IdProformaProveedor int
AS
BEGIN
 SET NOCOUNT ON;

 IF NOT EXISTS(SELECT 1 FROM dbo.ProformasProveedor WHERE IdProformaProveedor=@IdProformaProveedor) THROW 52004,N'Cotizacion no existe.',1;
 SELECT d.*,d.NombreProductoOriginal AS NombreProducto,d.PresentacionOriginal AS DescripcionPresentacion,
 CONVERT(decimal(28,6),d.Cantidad*d.ContenidoNormalizadoOriginal) AS ContenidoTotalNormalizado
 FROM dbo.ProformasProveedorDetalle d WHERE d.IdProformaProveedor=@IdProformaProveedor ORDER BY CASE WHEN d.NumeroLineaDocumento IS NULL THEN 1 ELSE 0 END,d.NumeroLineaDocumento,d.IdProformaProveedorDetalle;
END;

GO
