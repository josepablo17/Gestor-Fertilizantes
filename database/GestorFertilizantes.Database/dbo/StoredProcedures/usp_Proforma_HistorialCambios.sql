
CREATE   PROCEDURE dbo.usp_Proforma_HistorialCambios
 @IdProformaProveedor int
AS
BEGIN
 SET NOCOUNT ON;
IF NOT EXISTS(SELECT 1 FROM dbo.ProformasProveedor WHERE IdProformaProveedor=@IdProformaProveedor) THROW 52004,N'Cotizacion no existe.',1;
 SELECT * FROM dbo.CambiosCotizacion WHERE IdProformaProveedor=@IdProformaProveedor ORDER BY FechaCambio,IdCambioCotizacion;
END;

GO
