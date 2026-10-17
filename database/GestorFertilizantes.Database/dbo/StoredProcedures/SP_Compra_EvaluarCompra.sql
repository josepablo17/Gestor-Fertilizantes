
CREATE   PROCEDURE dbo.SP_Compra_EvaluarCompra @IdCompra bigint AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Compras WHERE IdCompra=@IdCompra) THROW 52004,N'Compra no existe.',1;
 SELECT a.*,h.CantidadComprasHistoricas,h.PrecioPromedioHistorico,
 a.PrecioUnitarioCalculado-h.PrecioPromedioHistorico AS DiferenciaVsPromedioHistorico
 FROM dbo.vw_ComprasAnalisis a OUTER APPLY(SELECT COUNT_BIG(*) AS CantidadComprasHistoricas,AVG(v.PrecioUnitarioCalculado) AS PrecioPromedioHistorico
 FROM dbo.vw_ComprasAnalisis v WHERE v.IdProducto=a.IdProducto AND v.IdPresentacionProducto=a.IdPresentacionProducto AND v.Moneda=a.Moneda
 AND (v.FechaCompra<a.FechaCompra OR (v.FechaCompra=a.FechaCompra AND v.IdCompra<a.IdCompra)))h WHERE a.IdCompra=@IdCompra;
END;

GO
