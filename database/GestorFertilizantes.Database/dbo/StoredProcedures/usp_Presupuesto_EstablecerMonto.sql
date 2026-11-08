CREATE PROCEDURE dbo.usp_Presupuesto_EstablecerMonto
 @IdPartidaPresupuesto bigint,@NuevoMonto decimal(18,4),@MontoAprobadoEsperado decimal(28,4),
 @IdOperacion uniqueidentifier,@Motivo nvarchar(500)
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION MontoPresupuesto;
 BEGIN TRY
 EXEC dbo.usp_Presupuesto_Bloquear;
 IF @NuevoMonto IS NULL OR @NuevoMonto<0 OR @IdOperacion IS NULL OR @IdOperacion='00000000-0000-0000-0000-000000000000'
   THROW 52000,N'Indique un nuevo monto no negativo y una operación válida.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.PartidasPresupuesto WHERE IdPartidaPresupuesto=@IdPartidaPresupuesto)
   THROW 52004,N'La partida no existe.',1;
 DECLARE @Actual decimal(28,4);
 SELECT @Actual=s.Aprobado FROM dbo.vw_SaldosPresupuesto s JOIN dbo.Presupuestos p ON p.IdPresupuesto=s.IdPresupuesto
   WHERE s.IdPartidaPresupuesto=@IdPartidaPresupuesto AND p.Estado='Aprobado';
 IF @Actual IS NULL THROW 52010,N'Solo se puede cambiar el monto de una partida aprobada.',1;
 IF @MontoAprobadoEsperado IS NULL OR @Actual<>@MontoAprobadoEsperado
   THROW 52009,N'El monto aprobado cambió. Recargue el presupuesto y revise el nuevo ajuste.',1;
 DECLARE @Ajuste decimal(18,4)=TRY_CONVERT(decimal(18,4),@NuevoMonto-@Actual);
 IF @Ajuste IS NULL THROW 52000,N'La diferencia supera el rango de un ajuste individual.',1;
 IF @Ajuste=0 THROW 52000,N'El nuevo monto es igual al aprobado; no hay cambios que guardar.',1;
 EXEC dbo.usp_Presupuesto_AjustarPartida @IdPartidaPresupuesto,@Ajuste,@IdOperacion,@Motivo;
 IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
 IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
 ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION MontoPresupuesto;
 THROW;
 END CATCH;
END;
GO
