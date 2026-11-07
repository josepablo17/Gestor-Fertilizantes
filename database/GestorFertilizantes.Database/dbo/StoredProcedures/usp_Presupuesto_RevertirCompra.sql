CREATE PROCEDURE dbo.usp_Presupuesto_RevertirCompra @IdCompra bigint, @IdOperacion uniqueidentifier, @Motivo nvarchar(500)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    DECLARE @TranInicial int = @@TRANCOUNT;
    IF @TranInicial = 0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION Presupuesto;
    BEGIN TRY
        EXEC dbo.usp_Presupuesto_RegistrarOperacion @IdOperacion, 'RevertirCompra', @Motivo;
        IF NOT EXISTS (SELECT 1 FROM dbo.Compras WITH (UPDLOCK,HOLDLOCK) WHERE IdCompra = @IdCompra)
            THROW 52004, N'La compra no existe.', 1;
        IF NOT EXISTS (SELECT 1 FROM dbo.vw_ComprasImputadasPresupuesto WHERE IdCompra = @IdCompra)
            THROW 52010, N'La compra no tiene una imputación activa.', 1;
        IF EXISTS
        (
            SELECT 1 FROM dbo.vw_ComprasImputadasPresupuesto AS m
            JOIN dbo.PartidasPresupuesto AS p ON p.IdPartidaPresupuesto = m.IdPartidaPresupuesto
            JOIN dbo.Presupuestos AS b ON b.IdPresupuesto = p.IdPresupuesto
            WHERE m.IdCompra = @IdCompra AND b.Estado = 'Cerrado'
        )
            THROW 52010, N'La compra pertenece a un presupuesto cerrado.', 1;

        INSERT dbo.MovimientosPresupuesto (IdOperacion, IdPartidaPresupuesto, Tipo, CambioAprobado, CambioComprometido,
            CambioEjecutado, IdCompromisoDetalle, IdCompra, IdMovimientoRevertido)
        SELECT @IdOperacion, m.IdPartidaPresupuesto, 'ReversionCompra', 0,
            CASE WHEN c.Estado = 'Abierto' THEN -m.CambioComprometido ELSE 0 END, -m.CambioEjecutado,
            m.IdCompromisoDetalle, @IdCompra, m.IdMovimientoPresupuesto
        FROM dbo.vw_ComprasImputadasPresupuesto AS m
        LEFT JOIN dbo.CompromisosCompraDetalle AS d ON d.IdCompromisoDetalle = m.IdCompromisoDetalle
        LEFT JOIN dbo.CompromisosCompra AS c ON c.IdCompromisoCompra = d.IdCompromisoCompra
        WHERE m.IdCompra = @IdCompra;
        IF @TranInicial = 0 COMMIT;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 AND @TranInicial = 0 ROLLBACK;
        ELSE IF XACT_STATE() = 1 ROLLBACK TRANSACTION Presupuesto;
        THROW;
    END CATCH;
END;
