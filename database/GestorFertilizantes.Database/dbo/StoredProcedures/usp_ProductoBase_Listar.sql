
CREATE   PROCEDURE dbo.usp_ProductoBase_Listar
 @SoloActivos bit=0,@Buscar nvarchar(150)=NULL
AS
BEGIN
 SET NOCOUNT ON;
SELECT IdProductoBase,Codigo,Nombre,FormulaDeclarada,Descripcion,ComparabilidadRevisada,Activo,FechaCreacion,FechaModificacion FROM dbo.ProductosBase WHERE (@SoloActivos=0 OR Activo=1) AND (@Buscar IS NULL OR Nombre LIKE N'%'+@Buscar+N'%') ORDER BY Nombre,IdProductoBase;
END;

GO
