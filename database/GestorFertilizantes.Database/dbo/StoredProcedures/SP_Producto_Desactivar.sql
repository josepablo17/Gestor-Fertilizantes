
CREATE   PROCEDURE dbo.SP_Producto_Desactivar
 @IdProducto int
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCatalogo;
 BEGIN TRY
IF NOT EXISTS(SELECT 1 FROM dbo.Productos WITH(UPDLOCK,HOLDLOCK) WHERE IdProducto=@IdProducto) THROW 52004,N'Producto no existe.',1; UPDATE dbo.Productos SET Activo=0,FechaModificacion=SYSUTCDATETIME() WHERE IdProducto=@IdProducto; SELECT 1 AS FilasAfectadas;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;

GO
