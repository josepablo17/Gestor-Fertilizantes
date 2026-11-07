
CREATE   PROCEDURE dbo.SP_Compra_UltimoPrecio
 @IdProducto int,@IdPresentacionProducto int,@Moneda nvarchar(10),@FechaLimite date=NULL,@IdCompraLimite int=NULL AS
BEGIN
 SET NOCOUNT ON;
 IF @Moneda IS NULL OR @Moneda NOT IN(N'CRC',N'USD') THROW 52000,N'Indique una moneda CRC o USD para consultar compras.',1;
 SELECT *
 FROM dbo.fn_Compra_UltimoPrecio(@IdProducto,@IdPresentacionProducto,@Moneda,@FechaLimite,@IdCompraLimite);
END;

GO
