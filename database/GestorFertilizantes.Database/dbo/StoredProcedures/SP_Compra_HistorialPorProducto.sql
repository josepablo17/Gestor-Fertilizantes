
CREATE   PROCEDURE dbo.SP_Compra_HistorialPorProducto @IdProducto int,@Moneda nvarchar(10)=NULL AS
BEGIN
 SET NOCOUNT ON;
 SELECT * FROM dbo.vw_ComprasAnalisis WHERE IdProducto=@IdProducto AND (@Moneda IS NULL OR Moneda=@Moneda) ORDER BY FechaCompra DESC,IdCompra DESC;
END;

GO
