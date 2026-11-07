CREATE PROCEDURE dbo.usp_Presupuesto_Crear @Nombre nvarchar(150), @FechaInicio date, @FechaFin date,
    @Moneda nvarchar(10), @PartidasJson nvarchar(max), @IdOperacion uniqueidentifier,
    @Motivo nvarchar(500), @IdPresupuesto bigint OUTPUT, @IdFinca int = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    DECLARE @TranInicial int = @@TRANCOUNT;
    IF @TranInicial = 0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION Presupuesto;
    BEGIN TRY
        SET @Moneda = UPPER(TRIM(@Moneda));
        IF NULLIF(TRIM(@Nombre),N'') IS NULL OR @FechaInicio IS NULL OR @FechaFin IS NULL OR @FechaFin < @FechaInicio
            OR @Moneda IS NULL OR @Moneda NOT IN ('CRC','USD')
            THROW 52000, N'Indique nombre, período y moneda CRC o USD.', 1;
        EXEC dbo.usp_Presupuesto_ValidarLineas @PartidasJson, N'idRubroPresupuesto';
        DECLARE @Partidas table (IdRubro bigint, Monto decimal(18,4));
        INSERT @Partidas SELECT IdRubro, Monto FROM OPENJSON(@PartidasJson)
            WITH (IdRubro bigint '$.idRubroPresupuesto', Monto decimal(18,4) '$.monto');
        IF EXISTS (SELECT IdRubro FROM @Partidas GROUP BY IdRubro HAVING COUNT(*) > 1)
            THROW 52009, N'El rubro se repite en el presupuesto.', 1;

        EXEC dbo.usp_Presupuesto_RegistrarOperacion @IdOperacion, 'CrearPresupuesto', @Motivo;
        IF @IdFinca IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Fincas WITH (HOLDLOCK) WHERE IdFinca = @IdFinca AND Activa = 1)
            THROW 52000, N'Seleccione una finca activa.', 1;
        IF EXISTS (SELECT 1 FROM @Partidas AS p LEFT JOIN dbo.RubrosPresupuesto AS r WITH (HOLDLOCK)
            ON r.IdRubroPresupuesto = p.IdRubro AND r.Activo = 1 WHERE r.IdRubroPresupuesto IS NULL)
            THROW 52000, N'Use rubros activos para todas las partidas.', 1;

        INSERT dbo.Presupuestos (Nombre, IdFinca, FechaInicio, FechaFin, Moneda, IdOperacionCreacion)
        VALUES (TRIM(@Nombre), @IdFinca, @FechaInicio, @FechaFin, @Moneda, @IdOperacion);
        SET @IdPresupuesto = CONVERT(bigint,SCOPE_IDENTITY());
        INSERT dbo.PartidasPresupuesto (IdPresupuesto, IdRubroPresupuesto, MontoInicial)
        SELECT @IdPresupuesto, CONVERT(int,IdRubro), Monto FROM @Partidas;
        IF @TranInicial = 0 COMMIT;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 AND @TranInicial = 0 ROLLBACK;
        ELSE IF XACT_STATE() = 1 ROLLBACK TRANSACTION Presupuesto;
        THROW;
    END CATCH;
END;
