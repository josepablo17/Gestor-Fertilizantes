CREATE PROCEDURE dbo.usp_Compra_ListarDocumentos
 @Busqueda nvarchar(150)=NULL,@Moneda nvarchar(10)=NULL,@Fecha date=NULL,@Pagina int=1,@TamanoPagina int=20
AS
BEGIN
 SET NOCOUNT ON;
 IF @Pagina IS NULL OR @Pagina<1 OR @TamanoPagina IS NULL OR @TamanoPagina NOT BETWEEN 1 AND 100
   THROW 52000,N'Paginación inválida.',1;
 DECLARE @Filtradas table(Id bigint PRIMARY KEY);
 INSERT @Filtradas SELECT h.IdCompraCabecera FROM dbo.ComprasCabecera h JOIN dbo.Proveedores p ON p.IdProveedor=h.IdProveedor
 WHERE (@Moneda IS NULL OR h.Moneda=@Moneda) AND (@Fecha IS NULL OR h.FechaCompra=@Fecha)
 AND (@Busqueda IS NULL OR p.Nombre LIKE N'%'+@Busqueda+N'%' OR h.NumeroFactura LIKE N'%'+@Busqueda+N'%'
 OR CONCAT(N'COM-',FORMAT(h.IdCompraCabecera,'000000')) LIKE N'%'+@Busqueda+N'%'
 OR EXISTS(SELECT 1 FROM dbo.Compras c JOIN dbo.Productos pr ON pr.IdProducto=c.IdProducto
   WHERE c.IdCompraCabecera=h.IdCompraCabecera AND pr.Nombre LIKE N'%'+@Busqueda+N'%'));
 SELECT COUNT_BIG(*) AS TotalRegistros FROM @Filtradas;
 SELECT h.IdCompraCabecera,h.IdProveedor,p.Nombre AS NombreProveedor,h.FechaCompra,h.Moneda,h.NumeroFactura,h.Observaciones,
   COUNT(c.IdCompra) AS CantidadProductos,CONVERT(decimal(28,4),SUM(c.PrecioTotal)) AS Total
 FROM @Filtradas f JOIN dbo.ComprasCabecera h ON h.IdCompraCabecera=f.Id JOIN dbo.Proveedores p ON p.IdProveedor=h.IdProveedor
 JOIN dbo.Compras c ON c.IdCompraCabecera=h.IdCompraCabecera
 GROUP BY h.IdCompraCabecera,h.IdProveedor,p.Nombre,h.FechaCompra,h.Moneda,h.NumeroFactura,h.Observaciones
 ORDER BY h.FechaCompra DESC,h.IdCompraCabecera DESC
 OFFSET CONVERT(bigint,@Pagina-1)*@TamanoPagina ROWS FETCH NEXT @TamanoPagina ROWS ONLY;
END;
GO
