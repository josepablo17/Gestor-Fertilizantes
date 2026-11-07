CREATE PROCEDURE dbo.usp_RubroPresupuesto_Guardar @Codigo nvarchar(30), @Nombre nvarchar(150),
    @IdRubroPresupuesto int = NULL OUTPUT, @Activo bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    IF NULLIF(TRIM(@Codigo),N'') IS NULL OR NULLIF(TRIM(@Nombre),N'') IS NULL OR @Activo IS NULL
        THROW 52000, N'Indique código, nombre y estado del rubro.', 1;
    IF @IdRubroPresupuesto IS NULL
    BEGIN
        INSERT dbo.RubrosPresupuesto (Codigo, Nombre, Activo) VALUES (TRIM(@Codigo), TRIM(@Nombre), @Activo);
        SET @IdRubroPresupuesto = CONVERT(int,SCOPE_IDENTITY());
    END
    ELSE
    BEGIN
        UPDATE dbo.RubrosPresupuesto SET Codigo = TRIM(@Codigo), Nombre = TRIM(@Nombre), Activo = @Activo
        WHERE IdRubroPresupuesto = @IdRubroPresupuesto;
        IF @@ROWCOUNT = 0 THROW 52004, N'El rubro no existe.', 1;
    END;
END;
