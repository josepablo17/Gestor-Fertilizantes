CREATE PROCEDURE dbo.usp_Presupuesto_RegistrarOperacion
    @IdOperacion uniqueidentifier, @Tipo varchar(24), @Motivo nvarchar(500)
AS
BEGIN
    SET NOCOUNT ON;
    IF @IdOperacion IS NULL OR NULLIF(TRIM(@Motivo),N'') IS NULL
        THROW 52000, N'Indique un identificador de operación y su motivo.', 1;
    EXEC dbo.usp_Presupuesto_Bloquear;
    IF EXISTS (SELECT 1 FROM dbo.OperacionesPresupuesto WHERE IdOperacion = @IdOperacion)
        THROW 52009, N'La operación presupuestaria ya fue registrada.', 1;
    INSERT dbo.OperacionesPresupuesto (IdOperacion, Tipo, Motivo)
    VALUES (@IdOperacion, @Tipo, TRIM(@Motivo));
END;
