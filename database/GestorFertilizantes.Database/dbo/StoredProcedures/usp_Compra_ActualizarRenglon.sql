CREATE PROCEDURE dbo.usp_Compra_ActualizarRenglon
 @IdCompraCabecera bigint,@IdCompra bigint,@Version binary(8),@IdProducto int,@IdPresentacionProducto int,
 @CantidadComprada decimal(18,4),@PrecioTotal decimal(18,4),@Observaciones nvarchar(500)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION RenglonCompra;
 BEGIN TRY
 EXEC dbo.usp_Presupuesto_Bloquear;
 DECLARE @Proveedor int,@Fecha date,@Moneda nvarchar(10);
 SELECT @Proveedor=IdProveedor,@Fecha=FechaCompra,@Moneda=Moneda FROM dbo.ComprasCabecera WITH(UPDLOCK,HOLDLOCK)
 WHERE IdCompraCabecera=@IdCompraCabecera;
 IF @Proveedor IS NULL OR NOT EXISTS(SELECT 1 FROM dbo.Compras WHERE IdCompraCabecera=@IdCompraCabecera AND IdCompra=@IdCompra)
   THROW 52004,N'El renglón no pertenece a esta compra.',1;
 IF @Version IS NULL OR NOT EXISTS(SELECT 1 FROM dbo.ComprasCabecera WHERE IdCompraCabecera=@IdCompraCabecera AND Version=@Version)
   THROW 52009,N'La compra cambió. Recargue la página antes de guardar.',1;
 EXEC dbo.SP_Compra_Actualizar @IdCompra,@IdProducto,@Proveedor,@IdPresentacionProducto,@Fecha,@CantidadComprada,@PrecioTotal,@Moneda,@Observaciones;
 IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
 IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
 ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION RenglonCompra;
 THROW;
 END CATCH;
END;
GO
