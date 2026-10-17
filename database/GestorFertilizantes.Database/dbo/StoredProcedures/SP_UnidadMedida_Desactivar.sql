
CREATE   PROCEDURE dbo.SP_UnidadMedida_Desactivar
 @IdUnidadMedida int
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCatalogo;
 BEGIN TRY
IF NOT EXISTS(SELECT 1 FROM dbo.UnidadesMedida WITH(UPDLOCK,HOLDLOCK) WHERE IdUnidadMedida=@IdUnidadMedida) THROW 52004,N'Unidad no existe.',1;
 IF EXISTS(SELECT 1 FROM dbo.UnidadesMedida WHERE IdUnidadMedida=@IdUnidadMedida AND EsUnidadBase=1) THROW 52010,N'No se desactiva una unidad base.',1;
 IF EXISTS(SELECT 1 FROM dbo.PresentacionesProducto WHERE IdUnidadMedida=@IdUnidadMedida AND Activo=1) THROW 52010,N'Hay presentaciones activas que utilizan la unidad.',1;
 UPDATE dbo.UnidadesMedida SET Activo=0 WHERE IdUnidadMedida=@IdUnidadMedida; SELECT 1 AS FilasAfectadas;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;

GO
