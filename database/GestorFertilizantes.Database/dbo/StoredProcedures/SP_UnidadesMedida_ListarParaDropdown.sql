
CREATE   PROCEDURE dbo.SP_UnidadesMedida_ListarParaDropdown

AS
BEGIN
 SET NOCOUNT ON;
SELECT IdUnidadMedida,Codigo,Nombre,TipoBase,FactorConversion,EsUnidadBase FROM dbo.UnidadesMedida WHERE Activo=1 ORDER BY TipoBase,Codigo;
END;

GO
