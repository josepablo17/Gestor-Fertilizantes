CREATE PROCEDURE dbo.usp_Presupuesto_ListarCatalogos
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdFinca, Codigo, Nombre, Activa FROM dbo.Fincas ORDER BY Nombre, IdFinca;
    SELECT IdRubroPresupuesto, Codigo, Nombre, Activo FROM dbo.RubrosPresupuesto ORDER BY Nombre, IdRubroPresupuesto;
END;
