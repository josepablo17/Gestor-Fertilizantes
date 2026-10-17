
CREATE   PROCEDURE dbo.SP_Proveedor_ObtenerPorId
 @IdProveedor int
AS
BEGIN
 SET NOCOUNT ON;
IF NOT EXISTS(SELECT 1 FROM dbo.Proveedores WHERE IdProveedor=@IdProveedor) THROW 52004,N'Proveedor no existe.',1; SELECT * FROM dbo.Proveedores WHERE IdProveedor=@IdProveedor;
END;

GO
