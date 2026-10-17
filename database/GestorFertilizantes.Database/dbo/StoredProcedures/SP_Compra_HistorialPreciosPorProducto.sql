
CREATE   PROCEDURE dbo.SP_Compra_HistorialPreciosPorProducto @IdProducto int,@IdPresentacionProducto int,@Moneda nvarchar(10) AS
BEGIN
 SET NOCOUNT ON;
 IF @Moneda IS NULL OR @Moneda NOT IN(N'CRC',N'USD') THROW 52000,N'Indique una moneda CRC o USD para comparar compras.',1; SELECT * FROM dbo.vw_ComprasAnalisis WHERE IdProducto=@IdProducto AND IdPresentacionProducto=@IdPresentacionProducto AND Moneda=@Moneda ORDER BY FechaCompra DESC,IdCompra DESC;
END;

GO
