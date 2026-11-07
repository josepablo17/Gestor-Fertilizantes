CREATE PROCEDURE dbo.usp_Presupuesto_Aprobar @IdPresupuesto bigint, @IdOperacion uniqueidentifier, @Motivo nvarchar(500)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    DECLARE @TranInicial int = @@TRANCOUNT;
    IF @TranInicial = 0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION Presupuesto;
    BEGIN TRY
        EXEC dbo.usp_Presupuesto_RegistrarOperacion @IdOperacion, 'Aprobar', @Motivo;
        DECLARE @IdFinca int, @Moneda char(3), @Inicio date, @Fin date;
        SELECT @IdFinca = IdFinca, @Moneda = Moneda, @Inicio = FechaInicio, @Fin = FechaFin
        FROM dbo.Presupuestos WHERE IdPresupuesto = @IdPresupuesto AND Estado = 'Borrador';
        IF @Inicio IS NULL
            THROW 52010, N'El presupuesto debe estar en borrador para aprobarlo.', 1;
        IF @IdFinca IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Fincas WITH (HOLDLOCK) WHERE IdFinca = @IdFinca AND Activa = 1)
            THROW 52000, N'La finca del presupuesto debe estar activa.', 1;
        IF NOT EXISTS (SELECT 1 FROM dbo.PartidasPresupuesto WHERE IdPresupuesto = @IdPresupuesto)
            OR EXISTS (SELECT 1 FROM dbo.PartidasPresupuesto AS p JOIN dbo.RubrosPresupuesto AS r WITH (HOLDLOCK)
                ON r.IdRubroPresupuesto = p.IdRubroPresupuesto WHERE p.IdPresupuesto = @IdPresupuesto AND r.Activo = 0)
            THROW 52000, N'El presupuesto requiere partidas con rubros activos.', 1;

        IF EXISTS
        (
            SELECT 1 FROM dbo.Presupuestos AS otro
            JOIN dbo.PartidasPresupuesto AS partidaOtra ON partidaOtra.IdPresupuesto = otro.IdPresupuesto
            JOIN dbo.PartidasPresupuesto AS partida ON partida.IdRubroPresupuesto = partidaOtra.IdRubroPresupuesto
            WHERE partida.IdPresupuesto = @IdPresupuesto AND otro.Estado IN ('Aprobado','Cerrado')
                AND otro.Moneda = @Moneda AND (otro.IdFinca = @IdFinca OR (otro.IdFinca IS NULL AND @IdFinca IS NULL))
                AND otro.FechaInicio <= @Fin AND otro.FechaFin >= @Inicio
        )
            THROW 52010, N'Ya existe un presupuesto del mismo alcance, moneda y rubro en ese período.', 1;

        UPDATE dbo.Presupuestos SET Estado = 'Aprobado', IdOperacionAprobacion = @IdOperacion WHERE IdPresupuesto = @IdPresupuesto;
        INSERT dbo.MovimientosPresupuesto (IdOperacion, IdPartidaPresupuesto, Tipo, CambioAprobado, CambioComprometido, CambioEjecutado)
        SELECT @IdOperacion, IdPartidaPresupuesto, 'Aprobacion', MontoInicial, 0, 0
        FROM dbo.PartidasPresupuesto WHERE IdPresupuesto = @IdPresupuesto;
        IF @TranInicial = 0 COMMIT;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 AND @TranInicial = 0 ROLLBACK;
        ELSE IF XACT_STATE() = 1 ROLLBACK TRANSACTION Presupuesto;
        THROW;
    END CATCH;
END;
