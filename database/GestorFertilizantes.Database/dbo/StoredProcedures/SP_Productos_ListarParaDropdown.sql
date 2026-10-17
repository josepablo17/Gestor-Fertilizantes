
CREATE   PROCEDURE dbo.SP_Productos_ListarParaDropdown

AS
BEGIN
 SET NOCOUNT ON;
SELECT p.IdProducto,p.CodigoInterno,p.IdProductoBase,b.Codigo AS CodigoProductoBase,b.Nombre AS NombreProductoBase,
 b.FormulaDeclarada,b.ComparabilidadRevisada,p.IdMarca,m.Nombre AS Marca,p.Nombre,p.Categoria,p.Descripcion,p.Activo,p.FechaCreacion,p.FechaModificacion
 FROM dbo.Productos p JOIN dbo.ProductosBase b ON b.IdProductoBase=p.IdProductoBase LEFT JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca WHERE p.Activo=1 AND b.Activo=1 AND (p.IdMarca IS NULL OR m.Activo=1) ORDER BY p.Nombre,p.IdProducto;
END;

GO
