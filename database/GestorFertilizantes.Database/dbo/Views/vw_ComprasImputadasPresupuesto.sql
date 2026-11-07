CREATE VIEW dbo.vw_ComprasImputadasPresupuesto
AS
SELECT m.IdMovimientoPresupuesto, m.IdCompra, m.IdPartidaPresupuesto, m.IdCompromisoDetalle, m.CambioComprometido, m.CambioEjecutado
FROM dbo.MovimientosPresupuesto AS m
WHERE m.Tipo = 'Compra' AND NOT EXISTS
    (SELECT 1 FROM dbo.MovimientosPresupuesto AS r WHERE r.IdMovimientoRevertido = m.IdMovimientoPresupuesto);
