CREATE PROCEDURE dbo.usp_Presupuesto_Cerrar @IdPresupuesto bigint, @IdOperacion uniqueidentifier, @Motivo nvarchar(500)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    DECLARE @TranInicial int = @@TRANCOUNT;
    IF @TranInicial = 0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION Presupuesto;
    BEGIN TRY
        EXEC dbo.usp_Presupuesto_RegistrarOperacion @IdOperacion, 'CerrarPresupuesto', @Motivo;
        IF EXISTS (SELECT 1 FROM dbo.vw_SaldosPresupuesto WHERE IdPresupuesto = @IdPresupuesto AND Comprometido > 0)
            THROW 52010, N'El presupuesto tiene compromisos con saldo pendiente.', 1;
        UPDATE dbo.Presupuestos SET Estado = 'Cerrado', IdOperacionCierre = @IdOperacion
        WHERE IdPresupuesto = @IdPresupuesto AND Estado = 'Aprobado';
        IF @@ROWCOUNT = 0 THROW 52010, N'El presupuesto debe estar aprobado para cerrarlo.', 1;
        IF @TranInicial = 0 COMMIT;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 AND @TranInicial = 0 ROLLBACK;
        ELSE IF XACT_STATE() = 1 ROLLBACK TRANSACTION Presupuesto;
        THROW;
    END CATCH;
END;
