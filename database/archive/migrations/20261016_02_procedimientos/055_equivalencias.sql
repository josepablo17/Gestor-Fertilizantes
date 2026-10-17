CREATE OR ALTER PROCEDURE dbo.SP_CompraAutomatica_BuscarEquivalencia
 @CodigoProveedor nvarchar(100)=NULL,@DescripcionProveedor nvarchar(300),@IdProveedor int
AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Proveedores WHERE IdProveedor=@IdProveedor AND Activo=1)
 THROW 52000,N'Indique un proveedor activo para buscar sus equivalencias.',1;
 DECLARE @Codigo nvarchar(100)=NULLIF(UPPER(LTRIM(RTRIM(@CodigoProveedor))),N''),
 @Descripcion nvarchar(300)=NULLIF(UPPER(LTRIM(RTRIM(@DescripcionProveedor))),N'');
 DECLARE @C table(IdProducto int,IdPresentacionProducto int,NombreProducto nvarchar(150),NombrePresentacion nvarchar(150),CodigoNormalizado nvarchar(100),DescripcionNormalizada nvarchar(300));
 INSERT @C SELECT e.IdProducto,e.IdPresentacionProducto,p.Nombre,COALESCE(pp.Descripcion,N''),e.CodigoNormalizado,UPPER(LTRIM(RTRIM(e.DescripcionProveedor)))
 FROM dbo.CompraAutomaticaEquivalencias e JOIN dbo.Productos p ON p.IdProducto=e.IdProducto AND p.Activo=1
 JOIN dbo.ProductosBase b ON b.IdProductoBase=p.IdProductoBase AND b.Activo=1 LEFT JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca
 LEFT JOIN dbo.PresentacionesProducto pp ON pp.IdPresentacionProducto=e.IdPresentacionProducto LEFT JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=pp.IdUnidadMedida
 WHERE e.IdProveedor=@IdProveedor AND e.Activo=1 AND (p.IdMarca IS NULL OR m.Activo=1)
 AND (e.IdPresentacionProducto IS NULL OR (pp.Activo=1 AND u.Activo=1));
 IF @Codigo IS NOT NULL AND EXISTS(SELECT 1 FROM @C WHERE CodigoNormalizado=@Codigo)
 BEGIN
  SELECT IdProducto,IdPresentacionProducto,NombreProducto,NombrePresentacion FROM @C WHERE CodigoNormalizado=@Codigo;
  RETURN;
 END;
 IF (SELECT COUNT(*) FROM @C WHERE DescripcionNormalizada=@Descripcion)>1
 THROW 52009,N'Hay varias equivalencias del mismo proveedor; requiere seleccion manual.',1;
 SELECT IdProducto,IdPresentacionProducto,NombreProducto,NombrePresentacion FROM @C WHERE DescripcionNormalizada=@Descripcion;
END;
GO
