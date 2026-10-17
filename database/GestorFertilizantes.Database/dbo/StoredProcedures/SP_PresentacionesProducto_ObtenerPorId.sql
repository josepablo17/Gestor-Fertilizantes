
CREATE   PROCEDURE dbo.SP_PresentacionesProducto_ObtenerPorId
 @IdPresentacionProducto int
AS
BEGIN
 SET NOCOUNT ON;
IF NOT EXISTS(SELECT 1 FROM dbo.PresentacionesProducto WHERE IdPresentacionProducto=@IdPresentacionProducto) THROW 52004,N'Presentacion no existe.',1;
SELECT pp.*,p.Nombre AS NombreProducto,p.IdProductoBase,p.IdMarca,m.Nombre AS Marca,u.Codigo AS CodigoUnidadMedida,u.Nombre AS NombreUnidadMedida,u.TipoBase,u.FactorConversion
 FROM dbo.PresentacionesProducto pp JOIN dbo.Productos p ON p.IdProducto=pp.IdProducto LEFT JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=pp.IdUnidadMedida WHERE pp.IdPresentacionProducto=@IdPresentacionProducto;
END;

GO
