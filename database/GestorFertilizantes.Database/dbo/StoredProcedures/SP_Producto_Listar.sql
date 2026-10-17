
CREATE   PROCEDURE dbo.SP_Producto_Listar
 @SoloActivos bit=0,@Buscar nvarchar(150)=NULL,@IdProductoBase int=NULL,@IdMarca int=NULL
AS
BEGIN
 SET NOCOUNT ON;
SELECT p.IdProducto,p.CodigoInterno,p.IdProductoBase,b.Codigo AS CodigoProductoBase,b.Nombre AS NombreProductoBase,
 b.FormulaDeclarada,b.ComparabilidadRevisada,p.IdMarca,m.Nombre AS Marca,p.Nombre,p.Categoria,p.Descripcion,p.Activo,p.FechaCreacion,p.FechaModificacion
 FROM dbo.Productos p JOIN dbo.ProductosBase b ON b.IdProductoBase=p.IdProductoBase LEFT JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca
 WHERE (@SoloActivos=0 OR p.Activo=1) AND (@Buscar IS NULL OR p.Nombre LIKE N'%'+@Buscar+N'%' OR p.CodigoInterno=@Buscar)
 AND (@IdProductoBase IS NULL OR p.IdProductoBase=@IdProductoBase) AND (@IdMarca IS NULL OR p.IdMarca=@IdMarca) ORDER BY p.Nombre,p.IdProducto;
END;

GO
