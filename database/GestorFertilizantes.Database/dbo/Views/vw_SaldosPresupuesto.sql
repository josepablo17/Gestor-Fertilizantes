CREATE VIEW dbo.vw_SaldosPresupuesto
AS
SELECT p.IdPartidaPresupuesto, p.IdPresupuesto, p.IdRubroPresupuesto, p.MontoInicial,
    s.Aprobado, s.Comprometido, s.Ejecutado, s.Aprobado - s.Comprometido - s.Ejecutado AS Disponible
FROM dbo.PartidasPresupuesto AS p
OUTER APPLY
(
    SELECT CONVERT(decimal(28,4), COALESCE(SUM(m.CambioAprobado),0)) AS Aprobado,
        CONVERT(decimal(28,4), COALESCE(SUM(m.CambioComprometido),0)) AS Comprometido,
        CONVERT(decimal(28,4), COALESCE(SUM(m.CambioEjecutado),0)) AS Ejecutado
    FROM dbo.MovimientosPresupuesto AS m
    WHERE m.IdPartidaPresupuesto = p.IdPartidaPresupuesto
) AS s;
