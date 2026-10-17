
CREATE   PROCEDURE dbo.SP_UnidadMedida_Listar
 @SoloActivos bit=0
AS
BEGIN
 SET NOCOUNT ON;
SELECT * FROM dbo.UnidadesMedida WHERE @SoloActivos=0 OR Activo=1 ORDER BY TipoBase,Codigo;
END;

GO
