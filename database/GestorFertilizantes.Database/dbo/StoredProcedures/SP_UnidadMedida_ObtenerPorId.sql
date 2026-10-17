
CREATE   PROCEDURE dbo.SP_UnidadMedida_ObtenerPorId
 @IdUnidadMedida int
AS
BEGIN
 SET NOCOUNT ON;
IF NOT EXISTS(SELECT 1 FROM dbo.UnidadesMedida WHERE IdUnidadMedida=@IdUnidadMedida) THROW 52004,N'Unidad no existe.',1; SELECT * FROM dbo.UnidadesMedida WHERE IdUnidadMedida=@IdUnidadMedida;
END;

GO
