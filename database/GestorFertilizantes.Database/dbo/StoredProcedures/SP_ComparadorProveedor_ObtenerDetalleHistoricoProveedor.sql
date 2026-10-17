
CREATE   PROCEDURE dbo.SP_ComparadorProveedor_ObtenerDetalleHistoricoProveedor @IdProducto int,@IdPresentacionProducto int,@IdProveedor int,@Moneda nvarchar(10),@MesesAnalisis int=NULL AS
BEGIN
 SET NOCOUNT ON;
 IF @Moneda IS NULL OR @Moneda NOT IN(N'CRC',N'USD') THROW 52000,N'Indique una moneda CRC o USD para comparar compras.',1;
 IF @MesesAnalisis IS NOT NULL AND @MesesAnalisis NOT BETWEEN 1 AND 1200 THROW 52000,N'Meses de analisis fuera de rango.',1;
 SELECT * FROM dbo.vw_ComprasAnalisis WHERE IdProducto=@IdProducto AND IdPresentacionProducto=@IdPresentacionProducto AND Moneda=@Moneda AND IdProveedor=@IdProveedor
 AND (@MesesAnalisis IS NULL OR FechaCompra>=DATEADD(month,-@MesesAnalisis,CONVERT(date,GETDATE()))) ORDER BY FechaCompra DESC,IdCompra DESC;
END;

GO
