
CREATE   PROCEDURE dbo.usp_Proforma_Validar @IdProformaProveedor int AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION ValidarProforma;
 BEGIN TRY
  IF NOT EXISTS(SELECT 1 FROM dbo.ProformasProveedor WITH(UPDLOCK,HOLDLOCK)
  WHERE IdProformaProveedor=@IdProformaProveedor AND Estado IN('Borrador','EnRevision'))
  THROW 51206,N'La respuesta no existe o no se puede validar en su estado actual.',1;
  IF EXISTS(SELECT 1 FROM dbo.ProformasProveedor q JOIN dbo.Proveedores p ON p.IdProveedor=q.IdProveedor WHERE q.IdProformaProveedor=@IdProformaProveedor AND p.Activo=0)
  THROW 52000,N'El proveedor de la respuesta esta inactivo.',1;
  UPDATE dbo.ProformasProveedor SET Estado='Validada',FechaValidacion=SYSUTCDATETIME(),FechaModificacion=SYSUTCDATETIME()
  WHERE IdProformaProveedor=@IdProformaProveedor;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION ValidarProforma;
  THROW;
 END CATCH;
END;

GO
