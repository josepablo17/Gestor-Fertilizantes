
CREATE   PROCEDURE dbo.SP_ComparadorProveedor_ObtenerComparativa @IdProducto int,@IdPresentacionProducto int,@Moneda nvarchar(10),@MesesAnalisis int=NULL,@SoloAutorizados bit=0 AS
BEGIN
 SET NOCOUNT ON;
 IF @Moneda IS NULL OR @Moneda NOT IN(N'CRC',N'USD') THROW 52000,N'Indique una moneda CRC o USD para comparar compras.',1;
 IF @MesesAnalisis IS NOT NULL AND @MesesAnalisis NOT BETWEEN 1 AND 1200 THROW 52000,N'Meses de analisis fuera de rango.',1;
 WITH Filtradas AS(SELECT *,ROW_NUMBER() OVER(PARTITION BY IdProveedor ORDER BY FechaCompra DESC,IdCompra DESC) AS rn FROM dbo.vw_ComprasAnalisis
 WHERE IdProducto=@IdProducto AND IdPresentacionProducto=@IdPresentacionProducto AND Moneda=@Moneda AND (@MesesAnalisis IS NULL OR FechaCompra>=DATEADD(month,-@MesesAnalisis,CONVERT(date,GETDATE()))) AND (@SoloAutorizados=0 OR EsProveedorAutorizado=1))
 SELECT IdProveedor,MAX(NombreProveedor) AS NombreProveedor,Moneda,COUNT_BIG(*) AS CantidadCompras,AVG(PrecioUnitarioCalculado) AS PromedioHistorico,
 MIN(PrecioUnitarioCalculado) AS PrecioMinimoHistorico,MAX(PrecioUnitarioCalculado) AS PrecioMaximoHistorico,
 MAX(FechaCompra) AS FechaUltimaCompra,MAX(CASE WHEN rn=1 THEN PrecioUnitarioCalculado END) AS UltimoPrecioUnitario
 FROM Filtradas GROUP BY IdProveedor,Moneda ORDER BY UltimoPrecioUnitario,IdProveedor;
END;

GO
