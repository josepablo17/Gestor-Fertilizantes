CREATE PROCEDURE dbo.usp_Compra_ObtenerDocumento @IdCompraCabecera bigint AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.ComprasCabecera WHERE IdCompraCabecera=@IdCompraCabecera)
   THROW 52004,N'La compra no existe.',1;
 SELECT h.*,p.Nombre AS NombreProveedor,(SELECT COUNT(*) FROM dbo.Compras c WHERE c.IdCompraCabecera=h.IdCompraCabecera) AS CantidadProductos,
 (SELECT CONVERT(decimal(28,4),SUM(c.PrecioTotal)) FROM dbo.Compras c WHERE c.IdCompraCabecera=h.IdCompraCabecera) AS Total
 FROM dbo.ComprasCabecera h JOIN dbo.Proveedores p ON p.IdProveedor=h.IdProveedor WHERE h.IdCompraCabecera=@IdCompraCabecera;
 SELECT c.*,c.NombrePresentacion AS Presentacion,c.ContenidoEmpaque AS CantidadPresentacion,c.CodigoUnidad AS UnidadMedida
 FROM dbo.vw_ComprasAnalisis c WHERE c.IdCompraCabecera=@IdCompraCabecera ORDER BY c.NumeroLinea;
END;
GO
