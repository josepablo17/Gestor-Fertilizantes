CREATE PROCEDURE dbo.usp_Presupuesto_Bloquear @Modo varchar(12) = 'Exclusive'
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Resultado int;
    EXEC @Resultado = sys.sp_getapplock @Resource = N'Gestor:Presupuesto', @LockMode = @Modo,
        @LockOwner = 'Transaction', @LockTimeout = 10000;
    IF @Resultado < 0
        THROW 52010, N'El presupuesto está ocupado. Intente nuevamente.', 1;
END;
