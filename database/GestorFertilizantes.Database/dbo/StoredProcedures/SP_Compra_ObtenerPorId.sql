
CREATE   PROCEDURE dbo.SP_Compra_ObtenerPorId @IdCompra bigint AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Compras WHERE IdCompra=@IdCompra) THROW 52004,N'Compra no existe.',1;
 SELECT * FROM dbo.vw_ComprasAnalisis WHERE IdCompra=@IdCompra;
END;

GO
