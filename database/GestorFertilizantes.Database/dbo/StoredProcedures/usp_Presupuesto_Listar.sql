CREATE PROCEDURE dbo.usp_Presupuesto_Listar @IdFinca int = NULL, @Moneda char(3) = NULL, @Estado varchar(12) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.IdPresupuesto, p.Nombre, p.IdFinca, f.Nombre AS Finca, p.FechaInicio, p.FechaFin, p.Moneda, p.Estado,
        SUM(s.MontoInicial) AS MontoInicial, SUM(s.Aprobado) AS Aprobado, SUM(s.Comprometido) AS Comprometido,
        SUM(s.Ejecutado) AS Ejecutado, SUM(s.Disponible) AS Disponible
    FROM dbo.Presupuestos AS p JOIN dbo.vw_SaldosPresupuesto AS s ON s.IdPresupuesto = p.IdPresupuesto
    LEFT JOIN dbo.Fincas AS f ON f.IdFinca = p.IdFinca
    WHERE (@IdFinca IS NULL OR p.IdFinca = @IdFinca) AND (@Moneda IS NULL OR p.Moneda = @Moneda)
        AND (@Estado IS NULL OR p.Estado = @Estado)
    GROUP BY p.IdPresupuesto, p.Nombre, p.IdFinca, f.Nombre, p.FechaInicio, p.FechaFin, p.Moneda, p.Estado
    ORDER BY p.FechaInicio DESC, p.IdPresupuesto DESC;
END;
