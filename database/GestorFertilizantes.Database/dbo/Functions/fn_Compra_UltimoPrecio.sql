CREATE FUNCTION dbo.fn_Compra_UltimoPrecio
(
    @IdProducto int,
    @IdPresentacionProducto int,
    @Moneda nvarchar(10),
    @FechaLimite date,
    @IdCompraLimite int
)
RETURNS TABLE
AS
RETURN
(
    SELECT TOP (1) c.*
    FROM dbo.vw_ComprasAnalisis AS c
    WHERE c.IdProducto = @IdProducto AND c.IdPresentacionProducto = @IdPresentacionProducto
        AND c.Moneda = @Moneda AND c.FechaCompra <= CONVERT(date, GETDATE())
        AND (@IdCompraLimite IS NULL OR c.IdCompra <> @IdCompraLimite)
        AND (@FechaLimite IS NULL OR c.FechaCompra < @FechaLimite
            OR (c.FechaCompra = @FechaLimite AND (@IdCompraLimite IS NULL OR c.IdCompra < @IdCompraLimite)))
    ORDER BY c.FechaCompra DESC, c.IdCompra DESC
);
