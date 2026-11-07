CREATE PROCEDURE dbo.usp_Presupuesto_Consultar @IdPresupuesto bigint
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    DECLARE @TranInicial int = @@TRANCOUNT;
    IF @TranInicial = 0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION Presupuesto;
    BEGIN TRY
        EXEC dbo.usp_Presupuesto_Bloquear 'Shared';
        IF NOT EXISTS (SELECT 1 FROM dbo.Presupuestos WHERE IdPresupuesto = @IdPresupuesto)
            THROW 52004, N'El presupuesto no existe.', 1;
        SELECT p.IdPresupuesto, p.Nombre, p.IdFinca, f.Nombre AS Finca, p.FechaInicio, p.FechaFin, p.Moneda, p.Estado,
            c.FechaRegistro AS FechaCreacion, a.FechaRegistro AS FechaAprobacion,
            z.FechaRegistro AS FechaCierre, z.Motivo AS MotivoCierre
        FROM dbo.Presupuestos AS p LEFT JOIN dbo.Fincas AS f ON f.IdFinca = p.IdFinca
        JOIN dbo.OperacionesPresupuesto AS c ON c.IdOperacion = p.IdOperacionCreacion
        LEFT JOIN dbo.OperacionesPresupuesto AS a ON a.IdOperacion = p.IdOperacionAprobacion
        LEFT JOIN dbo.OperacionesPresupuesto AS z ON z.IdOperacion = p.IdOperacionCierre
        WHERE p.IdPresupuesto = @IdPresupuesto;

        SELECT s.IdPartidaPresupuesto, s.IdRubroPresupuesto, r.Nombre AS Rubro, s.MontoInicial, s.Aprobado,
            s.Comprometido, s.Ejecutado, s.Disponible
        FROM dbo.vw_SaldosPresupuesto AS s JOIN dbo.RubrosPresupuesto AS r ON r.IdRubroPresupuesto = s.IdRubroPresupuesto
        WHERE s.IdPresupuesto = @IdPresupuesto ORDER BY r.Nombre, s.IdPartidaPresupuesto;

        SELECT m.IdMovimientoPresupuesto, m.IdOperacion, m.IdPartidaPresupuesto, m.Tipo, m.CambioAprobado,
            m.CambioComprometido, m.CambioEjecutado, m.IdCompra, m.IdCompromisoDetalle, m.IdMovimientoRevertido,
            m.MotivoExceso, o.Motivo, o.FechaRegistro, o.UsuarioSql
        FROM dbo.MovimientosPresupuesto AS m JOIN dbo.PartidasPresupuesto AS p ON p.IdPartidaPresupuesto = m.IdPartidaPresupuesto
        JOIN dbo.OperacionesPresupuesto AS o ON o.IdOperacion = m.IdOperacion
        WHERE p.IdPresupuesto = @IdPresupuesto ORDER BY m.IdMovimientoPresupuesto DESC;

        SELECT s.IdCompromisoCompra, s.IdCompromisoDetalle, s.IdPartidaPresupuesto, s.IdProformaProveedorDetalle,
            c.FechaCompromiso, c.Estado, s.MontoReservado, s.Pendiente, s.Ejecutado, o.Motivo AS MotivoCierre
        FROM dbo.vw_SaldosCompromisoCompra AS s JOIN dbo.CompromisosCompra AS c ON c.IdCompromisoCompra = s.IdCompromisoCompra
        JOIN dbo.PartidasPresupuesto AS p ON p.IdPartidaPresupuesto = s.IdPartidaPresupuesto
        LEFT JOIN dbo.OperacionesPresupuesto AS o ON o.IdOperacion = c.IdOperacionCierre
        WHERE p.IdPresupuesto = @IdPresupuesto ORDER BY s.IdCompromisoCompra DESC, s.IdCompromisoDetalle;
        IF @TranInicial = 0 COMMIT;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 AND @TranInicial = 0 ROLLBACK;
        ELSE IF XACT_STATE() = 1 ROLLBACK TRANSACTION Presupuesto;
        THROW;
    END CATCH;
END;
