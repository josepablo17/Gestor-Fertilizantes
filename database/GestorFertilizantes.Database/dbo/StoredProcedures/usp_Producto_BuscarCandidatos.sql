
CREATE   PROCEDURE dbo.usp_Producto_BuscarCandidatos
 @Descripcion nvarchar(500),@IdProductoBase int=NULL,@IdMarca int=NULL
AS
BEGIN
 SET NOCOUNT ON;
 DECLARE @Texto nvarchar(1000)=dbo.ufn_NormalizarTextoCatalogo(@Descripcion);
 IF NULLIF(@Texto,N'') IS NULL THROW 52000,N'Descripcion vacia; requiere seleccion manual.',1;
 SELECT p.IdProducto,p.CodigoInterno,p.Nombre AS NombreProducto,p.IdProductoBase,p.IdMarca,m.Nombre AS Marca,b.FormulaDeclarada,
 CONVERT(bit,CASE WHEN dbo.ufn_NormalizarTextoCatalogo(p.Nombre)=@Texto THEN 1 ELSE 0 END) AS CoincidenciaExacta,
 COUNT(*) OVER() AS CantidadCandidatos
 FROM dbo.Productos p JOIN dbo.ProductosBase b ON b.IdProductoBase=p.IdProductoBase LEFT JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca
 WHERE p.Activo=1 AND b.Activo=1 AND (p.IdMarca IS NULL OR m.Activo=1)
 AND (@IdProductoBase IS NULL OR p.IdProductoBase=@IdProductoBase) AND (@IdMarca IS NULL OR p.IdMarca=@IdMarca)
 AND (p.CodigoInterno=@Descripcion OR CHARINDEX(N' '+dbo.ufn_NormalizarTextoCatalogo(p.Nombre)+N' ',N' '+@Texto+N' ')>0)
 ORDER BY CoincidenciaExacta DESC,p.IdProducto;
END;

GO
