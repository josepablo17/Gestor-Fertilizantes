
CREATE   PROCEDURE dbo.SP_PresentacionesProducto_Desactivar
 @IdPresentacionProducto int
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCatalogo;
 BEGIN TRY
IF NOT EXISTS(SELECT 1 FROM dbo.PresentacionesProducto WITH(UPDLOCK,HOLDLOCK) WHERE IdPresentacionProducto=@IdPresentacionProducto) THROW 52004,N'Presentacion no existe.',1; UPDATE dbo.PresentacionesProducto SET Activo=0,FechaModificacion=SYSUTCDATETIME() WHERE IdPresentacionProducto=@IdPresentacionProducto; SELECT 1 AS FilasAfectadas;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;

GO
