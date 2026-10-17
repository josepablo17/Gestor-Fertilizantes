
CREATE   PROCEDURE dbo.usp_Marca_Actualizar
 @IdMarca int,@Nombre nvarchar(150)
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCatalogo;
 BEGIN TRY
IF NULLIF(LTRIM(RTRIM(@Nombre)),N'') IS NULL THROW 52000,N'Nombre es obligatorio.',1;
IF NOT EXISTS(SELECT 1 FROM dbo.Marcas WITH(UPDLOCK,HOLDLOCK) WHERE IdMarca=@IdMarca) THROW 52004,N'Marca no existe.',1;
UPDATE dbo.Marcas SET Nombre=LTRIM(RTRIM(@Nombre)),FechaModificacion=SYSUTCDATETIME() WHERE IdMarca=@IdMarca;
SELECT @IdMarca AS IdMarca;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;

GO
