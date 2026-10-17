
CREATE   PROCEDURE dbo.usp_Marca_Listar
 @SoloActivos bit=0,@Buscar nvarchar(150)=NULL
AS
BEGIN
 SET NOCOUNT ON;
SELECT IdMarca,Nombre,Activo,FechaCreacion,FechaModificacion FROM dbo.Marcas WHERE (@SoloActivos=0 OR Activo=1) AND (@Buscar IS NULL OR Nombre LIKE N'%'+@Buscar+N'%') ORDER BY Nombre,IdMarca;
END;

GO
