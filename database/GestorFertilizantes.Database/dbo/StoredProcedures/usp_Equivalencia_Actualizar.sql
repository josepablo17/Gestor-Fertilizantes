
CREATE   PROCEDURE dbo.usp_Equivalencia_Actualizar
 @IdEquivalencia int,@CodigoProveedor nvarchar(100)=NULL,@DescripcionProveedor nvarchar(300),@IdProducto int,@IdPresentacionProducto int=NULL
AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.CompraAutomaticaEquivalencias WHERE IdEquivalencia=@IdEquivalencia) THROW 52004,N'Equivalencia no existe.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Productos WHERE IdProducto=@IdProducto AND Activo=1) THROW 52000,N'Producto inexistente o inactivo.',1;
 IF @IdPresentacionProducto IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.PresentacionesProducto WHERE IdPresentacionProducto=@IdPresentacionProducto AND IdProducto=@IdProducto AND Activo=1)
 THROW 52000,N'Presentacion incorrecta o inactiva.',1;
 UPDATE dbo.CompraAutomaticaEquivalencias SET CodigoProveedor=NULLIF(LTRIM(RTRIM(@CodigoProveedor)),N''),DescripcionProveedor=LTRIM(RTRIM(@DescripcionProveedor)),
 IdProducto=@IdProducto,IdPresentacionProducto=@IdPresentacionProducto,FechaModificacion=GETDATE() WHERE IdEquivalencia=@IdEquivalencia;
END;

GO
