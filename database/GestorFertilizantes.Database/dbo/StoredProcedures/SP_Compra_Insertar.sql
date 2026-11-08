
CREATE   PROCEDURE dbo.SP_Compra_Insertar @IdProducto int,@IdProveedor int,@IdPresentacionProducto int,@FechaCompra date,@CantidadComprada decimal(18,4),@PrecioTotal decimal(18,4),@Moneda nvarchar(10),@Observaciones nvarchar(500)=NULL,
 @DistribucionPresupuestoJson nvarchar(max)=NULL,@IdOperacionPresupuesto uniqueidentifier=NULL,
 @MotivoPresupuesto nvarchar(500)=NULL,@MotivoExcesoPresupuesto nvarchar(500)=NULL,
 @IdCompraCabecera bigint=NULL,@NumeroLinea int=NULL,@IdCompraInsertada bigint=NULL OUTPUT,@DevolverResultado bit=1 AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION CompraReal;
 BEGIN TRY
 EXEC dbo.usp_Presupuesto_Bloquear;
 IF @CantidadComprada IS NULL OR @CantidadComprada<=0 OR @PrecioTotal IS NULL OR @PrecioTotal<=0 OR @FechaCompra IS NULL OR @FechaCompra>CONVERT(date,GETDATE())
 THROW 52000,N'Compra requiere fecha no futura y cantidad e importe positivos.',1;
 SET @Moneda=UPPER(LTRIM(RTRIM(@Moneda)));
 IF @Moneda IS NULL OR @Moneda NOT IN(N'CRC',N'USD') THROW 52000,N'El modulo historico de compras admite CRC o USD.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Productos p JOIN dbo.ProductosBase b ON b.IdProductoBase=p.IdProductoBase LEFT JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca
 JOIN dbo.PresentacionesProducto pp ON pp.IdProducto=p.IdProducto JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=pp.IdUnidadMedida
 WHERE p.IdProducto=@IdProducto AND pp.IdPresentacionProducto=@IdPresentacionProducto AND p.Activo=1 AND b.Activo=1 AND (p.IdMarca IS NULL OR m.Activo=1) AND pp.Activo=1 AND u.Activo=1)
 OR NOT EXISTS(SELECT 1 FROM dbo.Proveedores WHERE IdProveedor=@IdProveedor AND Activo=1) THROW 52000,N'Catalogos inactivos o producto y presentacion incompatibles.',1;
 DECLARE @Precio decimal(18,6)=TRY_CONVERT(decimal(18,6),@PrecioTotal/@CantidadComprada);
 IF @Precio IS NULL OR @Precio<=0 THROW 52000,N'Precio por empaque fuera de rango.',1;
 IF @IdCompraCabecera IS NULL
 BEGIN
   INSERT dbo.ComprasCabecera(IdProveedor,FechaCompra,Moneda,Observaciones)
   VALUES(@IdProveedor,@FechaCompra,@Moneda,NULLIF(TRIM(@Observaciones),N''));
   SET @IdCompraCabecera=CONVERT(bigint,SCOPE_IDENTITY());
   SET @NumeroLinea=1;
 END;
 IF @NumeroLinea IS NULL OR @NumeroLinea<1 OR NOT EXISTS
 (SELECT 1 FROM dbo.ComprasCabecera WITH(UPDLOCK,HOLDLOCK) WHERE IdCompraCabecera=@IdCompraCabecera
 AND IdProveedor=@IdProveedor AND FechaCompra=@FechaCompra AND Moneda=@Moneda)
 THROW 52000,N'El renglón no corresponde a la cabecera de la compra.',1;
 INSERT dbo.Compras(IdCompraCabecera,NumeroLinea,IdProducto,IdProveedor,IdPresentacionProducto,FechaCompra,CantidadComprada,PrecioTotal,Moneda,PrecioUnitarioCalculado,Observaciones)
 VALUES(@IdCompraCabecera,@NumeroLinea,@IdProducto,@IdProveedor,@IdPresentacionProducto,@FechaCompra,@CantidadComprada,@PrecioTotal,@Moneda,@Precio,NULLIF(LTRIM(RTRIM(@Observaciones)),N''));
 DECLARE @Id bigint=CONVERT(bigint,SCOPE_IDENTITY());
 /* Cache de compatibilidad; todas las lecturas usan la vista recalculada. */
 UPDATE c SET PrecioUnitarioCalculado=v.PrecioUnitarioCalculado,IdCompraAnterior=v.IdCompraAnterior,PrecioUnitarioAnterior=v.PrecioUnitarioAnterior,
 DiferenciaPrecio=v.DiferenciaPrecio,PorcentajeCambioPrecio=v.PorcentajeCambioPrecio,TendenciaPrecio=v.TendenciaPrecio
 FROM dbo.Compras c JOIN dbo.vw_ComprasAnalisis v ON v.IdCompra=c.IdCompra
 WHERE c.IdProducto=@IdProducto AND c.IdPresentacionProducto=@IdPresentacionProducto AND c.Moneda=@Moneda;
 IF @DistribucionPresupuestoJson IS NOT NULL
 EXEC dbo.usp_Presupuesto_ImputarCompra @Id,@DistribucionPresupuestoJson,@IdOperacionPresupuesto,@MotivoPresupuesto,@MotivoExcesoPresupuesto;
 IF @TranInicial=0 COMMIT;
 SET @IdCompraInsertada=@Id;
 IF @DevolverResultado=1 SELECT @Id AS IdCompraInsertada;
 END TRY BEGIN CATCH
 IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK; ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION CompraReal;
 THROW;
 END CATCH;
END;

GO
