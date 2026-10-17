
CREATE   PROCEDURE dbo.SP_Proveedor_Listar
 @SoloActivos bit=0,@Buscar nvarchar(150)=NULL
AS
BEGIN
 SET NOCOUNT ON;
SELECT * FROM dbo.Proveedores WHERE (@SoloActivos=0 OR Activo=1) AND (@Buscar IS NULL OR Nombre LIKE N'%'+@Buscar+N'%') ORDER BY Nombre,IdProveedor;
END;

GO
