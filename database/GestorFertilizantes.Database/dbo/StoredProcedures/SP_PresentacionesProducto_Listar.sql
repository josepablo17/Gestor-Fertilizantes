
CREATE   PROCEDURE dbo.SP_PresentacionesProducto_Listar
 @IdProducto int=NULL,@SoloActivos bit=0
AS
BEGIN
 SET NOCOUNT ON;
SELECT pp.*,p.Nombre AS NombreProducto,p.IdProductoBase,p.IdMarca,m.Nombre AS Marca,u.Codigo AS CodigoUnidadMedida,u.Nombre AS NombreUnidadMedida,u.TipoBase,u.FactorConversion
 FROM dbo.PresentacionesProducto pp JOIN dbo.Productos p ON p.IdProducto=pp.IdProducto LEFT JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=pp.IdUnidadMedida WHERE (@IdProducto IS NULL OR pp.IdProducto=@IdProducto) AND (@SoloActivos=0 OR (pp.Activo=1 AND p.Activo=1 AND u.Activo=1)) ORDER BY p.Nombre,pp.CantidadNormalizada,pp.IdPresentacionProducto;
END;

GO
