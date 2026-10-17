
CREATE   PROCEDURE dbo.usp_ProductoBase_ObtenerPorId
 @IdProductoBase int
AS
BEGIN
 SET NOCOUNT ON;
IF NOT EXISTS(SELECT 1 FROM dbo.ProductosBase WHERE IdProductoBase=@IdProductoBase) THROW 52004,N'ProductoBase no existe.',1;
SELECT IdProductoBase,Codigo,Nombre,FormulaDeclarada,Descripcion,ComparabilidadRevisada,Activo,FechaCreacion,FechaModificacion FROM dbo.ProductosBase WHERE IdProductoBase=@IdProductoBase;
END;

GO
