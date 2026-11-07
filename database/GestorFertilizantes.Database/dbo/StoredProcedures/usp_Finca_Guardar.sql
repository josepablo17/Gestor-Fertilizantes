CREATE PROCEDURE dbo.usp_Finca_Guardar @Codigo nvarchar(30), @Nombre nvarchar(150),
    @IdFinca int = NULL OUTPUT, @Activa bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    IF NULLIF(TRIM(@Codigo),N'') IS NULL OR NULLIF(TRIM(@Nombre),N'') IS NULL OR @Activa IS NULL
        THROW 52000, N'Indique código, nombre y estado de la finca.', 1;
    IF @IdFinca IS NULL
    BEGIN
        INSERT dbo.Fincas (Codigo, Nombre, Activa) VALUES (TRIM(@Codigo), TRIM(@Nombre), @Activa);
        SET @IdFinca = CONVERT(int,SCOPE_IDENTITY());
    END
    ELSE
    BEGIN
        UPDATE dbo.Fincas SET Codigo = TRIM(@Codigo), Nombre = TRIM(@Nombre), Activa = @Activa WHERE IdFinca = @IdFinca;
        IF @@ROWCOUNT = 0 THROW 52004, N'La finca no existe.', 1;
    END;
END;
