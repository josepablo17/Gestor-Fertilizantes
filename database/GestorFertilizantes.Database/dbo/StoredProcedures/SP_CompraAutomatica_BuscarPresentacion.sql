
CREATE   PROCEDURE dbo.SP_CompraAutomatica_BuscarPresentacion
 @IdProducto int,@Cantidad decimal(18,6),@IdUnidadMedida int
AS
BEGIN
 SET NOCOUNT ON;
 IF @Cantidad IS NULL OR @Cantidad<=0 THROW 52000,N'La cantidad de contenido debe ser explicita y positiva.',1;
 DECLARE @Factor decimal(18,6),@Tipo nvarchar(20);
 SELECT @Factor=FactorConversion,@Tipo=TipoBase FROM dbo.UnidadesMedida WHERE IdUnidadMedida=@IdUnidadMedida AND Activo=1;
 IF @Factor IS NULL THROW 52000,N'Unidad inexistente o inactiva. No se infiere desde texto ambiguo.',1;
 DECLARE @Normalizada decimal(18,6)=TRY_CONVERT(decimal(18,6),@Cantidad*@Factor);
 IF @Normalizada IS NULL OR @Normalizada<=0 THROW 52000,N'Contenido normalizado fuera de rango.',1;
 IF (SELECT COUNT(*) FROM dbo.PresentacionesProducto pp JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=pp.IdUnidadMedida
 WHERE pp.IdProducto=@IdProducto AND pp.Activo=1 AND u.Activo=1 AND u.TipoBase=@Tipo AND pp.CantidadNormalizada=@Normalizada)>1
 THROW 52009,N'Hay varias presentaciones con ese contenido; requiere seleccion manual.',1;
 SELECT pp.IdPresentacionProducto,pp.Descripcion AS NombrePresentacion,pp.Cantidad,pp.IdUnidadMedida,u.Codigo,u.TipoBase,pp.CantidadNormalizada
 FROM dbo.PresentacionesProducto pp JOIN dbo.Productos p ON p.IdProducto=pp.IdProducto AND p.Activo=1
 JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=pp.IdUnidadMedida AND u.Activo=1
 WHERE pp.IdProducto=@IdProducto AND pp.Activo=1 AND u.TipoBase=@Tipo AND pp.CantidadNormalizada=@Normalizada;
END;

GO
