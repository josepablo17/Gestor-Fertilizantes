
CREATE   PROCEDURE dbo.SP_CompraAutomatica_InsertarEquivalencia
 @IdProveedor int,@CodigoProveedor nvarchar(100)=NULL,@DescripcionProveedor nvarchar(300),@IdProducto int,@IdPresentacionProducto int=NULL
AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Proveedores WHERE IdProveedor=@IdProveedor AND Activo=1)
 OR NOT EXISTS(SELECT 1 FROM dbo.Productos WHERE IdProducto=@IdProducto AND Activo=1)
 THROW 52000,N'Proveedor o producto inexistente/inactivo.',1;
 IF @IdPresentacionProducto IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.PresentacionesProducto WHERE IdPresentacionProducto=@IdPresentacionProducto AND IdProducto=@IdProducto AND Activo=1)
 THROW 52000,N'La presentacion debe estar activa y pertenecer al producto.',1;
 IF NULLIF(LTRIM(RTRIM(@DescripcionProveedor)),N'') IS NULL THROW 52000,N'Descripcion de proveedor obligatoria.',1;
 INSERT dbo.CompraAutomaticaEquivalencias(IdProveedor,CodigoProveedor,DescripcionProveedor,IdProducto,IdPresentacionProducto)
 VALUES(@IdProveedor,NULLIF(LTRIM(RTRIM(@CodigoProveedor)),N''),LTRIM(RTRIM(@DescripcionProveedor)),@IdProducto,@IdPresentacionProducto);
 SELECT CONVERT(int,SCOPE_IDENTITY()) AS IdEquivalencia;
END;

GO
