CREATE PROCEDURE dbo.usp_Presupuesto_AjustarPartida @IdPartidaPresupuesto bigint, @Ajuste decimal(18,4),
    @IdOperacion uniqueidentifier, @Motivo nvarchar(500)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    DECLARE @TranInicial int = @@TRANCOUNT;
    IF @TranInicial = 0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION Presupuesto;
    BEGIN TRY
        IF @Ajuste IS NULL OR @Ajuste = 0
            THROW 52000, N'Indique un ajuste distinto de cero.', 1;
        EXEC dbo.usp_Presupuesto_RegistrarOperacion @IdOperacion, 'Ajustar', @Motivo;
        DECLARE @Disponible decimal(30,4);
        SELECT @Disponible = s.Disponible FROM dbo.vw_SaldosPresupuesto AS s
        JOIN dbo.Presupuestos AS p ON p.IdPresupuesto = s.IdPresupuesto
        WHERE s.IdPartidaPresupuesto = @IdPartidaPresupuesto AND p.Estado = 'Aprobado';
        IF @Disponible IS NULL
            THROW 52010, N'La partida debe pertenecer a un presupuesto aprobado.', 1;
        IF @Ajuste < 0 AND @Disponible + @Ajuste < 0
            THROW 52010, N'La reducción excede el saldo disponible de la partida.', 1;

        INSERT dbo.MovimientosPresupuesto (IdOperacion, IdPartidaPresupuesto, Tipo, CambioAprobado, CambioComprometido, CambioEjecutado)
        VALUES (@IdOperacion, @IdPartidaPresupuesto, 'Ajuste', @Ajuste, 0, 0);
        IF @TranInicial = 0 COMMIT;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 AND @TranInicial = 0 ROLLBACK;
        ELSE IF XACT_STATE() = 1 ROLLBACK TRANSACTION Presupuesto;
        THROW;
    END CATCH;
END;
