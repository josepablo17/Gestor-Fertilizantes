CREATE PROCEDURE dbo.usp_Compromiso_Finalizar @IdCompromisoCompra bigint, @Estado varchar(12),
    @IdOperacion uniqueidentifier, @Motivo nvarchar(500)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    DECLARE @TranInicial int = @@TRANCOUNT;
    IF @TranInicial = 0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION Presupuesto;
    BEGIN TRY
        IF @Estado IS NULL OR @Estado NOT IN ('Cerrado','Cancelado')
            THROW 52000, N'Indique Cerrado o Cancelado para finalizar el compromiso.', 1;
        EXEC dbo.usp_Presupuesto_RegistrarOperacion @IdOperacion, 'FinalizarCompromiso', @Motivo;
        IF @Estado = 'Cancelado' AND EXISTS
            (SELECT 1 FROM dbo.vw_SaldosCompromisoCompra WHERE IdCompromisoCompra = @IdCompromisoCompra AND Ejecutado > 0)
            THROW 52010, N'Un compromiso con compras ejecutadas debe cerrarse.', 1;
        UPDATE dbo.CompromisosCompra SET Estado = @Estado, IdOperacionCierre = @IdOperacion
        WHERE IdCompromisoCompra = @IdCompromisoCompra AND Estado = 'Abierto';
        IF @@ROWCOUNT = 0 THROW 52010, N'El compromiso debe estar abierto.', 1;

        INSERT dbo.MovimientosPresupuesto (IdOperacion, IdPartidaPresupuesto, Tipo, CambioAprobado, CambioComprometido,
            CambioEjecutado, IdCompromisoDetalle)
        SELECT @IdOperacion, IdPartidaPresupuesto, 'Liberacion', 0, -Pendiente, 0, IdCompromisoDetalle
        FROM dbo.vw_SaldosCompromisoCompra WHERE IdCompromisoCompra = @IdCompromisoCompra AND Pendiente > 0;
        IF @TranInicial = 0 COMMIT;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 AND @TranInicial = 0 ROLLBACK;
        ELSE IF XACT_STATE() = 1 ROLLBACK TRANSACTION Presupuesto;
        THROW;
    END CATCH;
END;
