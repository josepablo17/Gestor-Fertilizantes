
CREATE   PROCEDURE dbo.usp_ProductoBase_CambiarActivo
 @IdProductoBase int,@Activo bit
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCatalogo;
 BEGIN TRY
IF @Activo IS NULL THROW 52000,N'Activo es obligatorio.',1;
IF NOT EXISTS(SELECT 1 FROM dbo.ProductosBase WITH(UPDLOCK,HOLDLOCK) WHERE IdProductoBase=@IdProductoBase) THROW 52004,N'ProductoBase no existe.',1;
UPDATE dbo.ProductosBase SET Activo=@Activo,FechaModificacion=SYSUTCDATETIME() WHERE IdProductoBase=@IdProductoBase; SELECT @IdProductoBase AS IdProductoBase;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;

GO
