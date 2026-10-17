
CREATE   PROCEDURE dbo.SP_Compra_ResumenInteligentePrecios @IdProducto int,@IdPresentacionProducto int,@Moneda nvarchar(10) AS
BEGIN
 SET NOCOUNT ON;
 IF @Moneda IS NULL OR @Moneda NOT IN(N'CRC',N'USD') THROW 52000,N'Indique una moneda CRC o USD para comparar compras.',1;
 SELECT IdProducto,IdPresentacionProducto,Moneda,COUNT_BIG(*) AS CantidadCompras,AVG(PrecioUnitarioCalculado) AS PrecioPromedioHistorico,
 MIN(PrecioUnitarioCalculado) AS PrecioMinimoHistorico,MAX(PrecioUnitarioCalculado) AS PrecioMaximoHistorico,
 MIN(FechaCompra) AS FechaPrimeraCompra,MAX(FechaCompra) AS FechaUltimaCompra FROM dbo.vw_ComprasAnalisis WHERE IdProducto=@IdProducto AND IdPresentacionProducto=@IdPresentacionProducto AND Moneda=@Moneda GROUP BY IdProducto,IdPresentacionProducto,Moneda;
END;

GO
