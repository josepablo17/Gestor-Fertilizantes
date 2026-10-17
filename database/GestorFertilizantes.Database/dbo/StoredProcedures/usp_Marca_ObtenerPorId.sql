
CREATE   PROCEDURE dbo.usp_Marca_ObtenerPorId
 @IdMarca int
AS
BEGIN
 SET NOCOUNT ON;
IF NOT EXISTS(SELECT 1 FROM dbo.Marcas WHERE IdMarca=@IdMarca) THROW 52004,N'Marca no existe.',1;
SELECT IdMarca,Nombre,Activo,FechaCreacion,FechaModificacion FROM dbo.Marcas WHERE IdMarca=@IdMarca;
END;

GO
