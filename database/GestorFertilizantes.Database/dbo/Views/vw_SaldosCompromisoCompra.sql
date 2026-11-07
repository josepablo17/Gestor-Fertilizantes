CREATE VIEW dbo.vw_SaldosCompromisoCompra
AS
SELECT d.IdCompromisoDetalle, d.IdCompromisoCompra, d.IdPartidaPresupuesto, d.IdProformaProveedorDetalle, d.MontoReservado,
    s.Pendiente, s.Ejecutado
FROM dbo.CompromisosCompraDetalle AS d
OUTER APPLY
(
    SELECT CONVERT(decimal(28,4), COALESCE(SUM(m.CambioComprometido),0)) AS Pendiente,
        CONVERT(decimal(28,4), COALESCE(SUM(m.CambioEjecutado),0)) AS Ejecutado
    FROM dbo.MovimientosPresupuesto AS m
    WHERE m.IdCompromisoDetalle = d.IdCompromisoDetalle
) AS s;
