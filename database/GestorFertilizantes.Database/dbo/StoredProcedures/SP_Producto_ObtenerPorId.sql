
CREATE   PROCEDURE dbo.SP_Producto_ObtenerPorId
 @IdProducto int
AS
BEGIN
 SET NOCOUNT ON;
IF NOT EXISTS(SELECT 1 FROM dbo.Productos WHERE IdProducto=@IdProducto) THROW 52004,N'Producto no existe.',1;
SELECT p.IdProducto,p.CodigoInterno,p.IdProductoBase,b.Codigo AS CodigoProductoBase,b.Nombre AS NombreProductoBase,
 b.FormulaDeclarada,b.ComparabilidadRevisada,p.IdMarca,m.Nombre AS Marca,p.Nombre,p.Categoria,p.Descripcion,p.Activo,p.FechaCreacion,p.FechaModificacion
 FROM dbo.Productos p JOIN dbo.ProductosBase b ON b.IdProductoBase=p.IdProductoBase LEFT JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca WHERE p.IdProducto=@IdProducto;
END;

GO
