
CREATE   PROCEDURE dbo.SP_Compra_Listar @Moneda nvarchar(10)=NULL,@Pagina int=1,@TamanoPagina int=50 AS
BEGIN
 SET NOCOUNT ON;
 IF @Pagina IS NULL OR @Pagina<1 OR @TamanoPagina IS NULL OR @TamanoPagina NOT BETWEEN 1 AND 200 THROW 52000,N'Paginacion invalida.',1;
 SELECT *,COUNT_BIG(*) OVER() AS TotalRegistros FROM dbo.vw_ComprasAnalisis WHERE @Moneda IS NULL OR Moneda=@Moneda
 ORDER BY FechaCompra DESC,IdCompra DESC OFFSET CONVERT(bigint,@Pagina-1)*@TamanoPagina ROWS FETCH NEXT @TamanoPagina ROWS ONLY;
END;

GO
