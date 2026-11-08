CREATE PROCEDURE dbo.usp_Compra_ActualizarCabecera
 @IdCompraCabecera bigint,@Version binary(8),@IdProveedor int,@FechaCompra date,@Moneda nvarchar(10),
 @NumeroFactura nvarchar(100)=NULL,@Observaciones nvarchar(500)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION CabeceraCompra;
 BEGIN TRY
 EXEC dbo.usp_Presupuesto_Bloquear;
 SET @Moneda=UPPER(TRIM(@Moneda));
 IF NOT EXISTS(SELECT 1 FROM dbo.ComprasCabecera WITH(UPDLOCK,HOLDLOCK) WHERE IdCompraCabecera=@IdCompraCabecera)
   THROW 52004,N'La compra no existe.',1;
 IF @Version IS NULL OR NOT EXISTS(SELECT 1 FROM dbo.ComprasCabecera WHERE IdCompraCabecera=@IdCompraCabecera AND Version=@Version)
   THROW 52009,N'La compra cambió. Recargue la página antes de guardar.',1;
 IF @FechaCompra IS NULL OR @FechaCompra>CONVERT(date,GETDATE()) OR @Moneda IS NULL OR @Moneda NOT IN(N'CRC',N'USD')
 OR NOT EXISTS(SELECT 1 FROM dbo.Proveedores WHERE IdProveedor=@IdProveedor AND Activo=1)
   THROW 52000,N'Indique proveedor activo, fecha no futura y moneda CRC o USD.',1;
 DECLARE @CambianDatos bit=CASE WHEN EXISTS(SELECT 1 FROM dbo.ComprasCabecera WHERE IdCompraCabecera=@IdCompraCabecera
   AND (IdProveedor<>@IdProveedor OR FechaCompra<>@FechaCompra OR Moneda<>@Moneda)) THEN 1 ELSE 0 END;
 IF @CambianDatos=1 AND EXISTS(SELECT 1 FROM dbo.Compras c JOIN dbo.vw_ComprasImputadasPresupuesto i ON i.IdCompra=c.IdCompra
   WHERE c.IdCompraCabecera=@IdCompraCabecera)
   THROW 52010,N'Revierta las distribuciones presupuestarias de los renglones antes de cambiar proveedor, fecha o moneda.',1;
 UPDATE dbo.ComprasCabecera SET IdProveedor=@IdProveedor,FechaCompra=@FechaCompra,Moneda=@Moneda,
   NumeroFactura=NULLIF(TRIM(@NumeroFactura),N''),Observaciones=NULLIF(TRIM(@Observaciones),N''),FechaModificacion=SYSUTCDATETIME()
 WHERE IdCompraCabecera=@IdCompraCabecera;
 IF @CambianDatos=1 UPDATE dbo.Compras SET IdProveedor=@IdProveedor,FechaCompra=@FechaCompra,Moneda=@Moneda,
   FechaModificacion=SYSUTCDATETIME() WHERE IdCompraCabecera=@IdCompraCabecera;
 IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
 IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
 ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION CabeceraCompra;
 THROW;
 END CATCH;
END;
GO
