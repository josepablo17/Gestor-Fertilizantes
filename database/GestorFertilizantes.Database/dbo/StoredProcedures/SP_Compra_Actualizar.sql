
CREATE   PROCEDURE dbo.SP_Compra_Actualizar @IdCompra bigint,@IdProducto int,@IdProveedor int,@IdPresentacionProducto int,@FechaCompra date,@CantidadComprada decimal(18,4),@PrecioTotal decimal(18,4),@Moneda nvarchar(10),@Observaciones nvarchar(500)=NULL AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION CompraReal;
 BEGIN TRY
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
 IF NOT EXISTS(SELECT 1 FROM dbo.Compras WITH(UPDLOCK,HOLDLOCK) WHERE IdCompra=@IdCompra) THROW 52004,N'Compra no existe.',1;
 DECLARE @ProductoAnterior int,@PresentacionAnterior int,@MonedaAnterior nvarchar(10);
 SELECT @ProductoAnterior=IdProducto,@PresentacionAnterior=IdPresentacionProducto,@MonedaAnterior=Moneda FROM dbo.Compras WHERE IdCompra=@IdCompra;
 UPDATE dbo.Compras SET IdProducto=@IdProducto,IdProveedor=@IdProveedor,IdPresentacionProducto=@IdPresentacionProducto,FechaCompra=@FechaCompra,
 CantidadComprada=@CantidadComprada,PrecioTotal=@PrecioTotal,Moneda=@Moneda,PrecioUnitarioCalculado=@Precio,Observaciones=NULLIF(LTRIM(RTRIM(@Observaciones)),N''),FechaModificacion=SYSDATETIME() WHERE IdCompra=@IdCompra;
 /* Cache de compatibilidad; todas las lecturas usan la vista recalculada. */
 UPDATE c SET PrecioUnitarioCalculado=v.PrecioUnitarioCalculado,IdCompraAnterior=v.IdCompraAnterior,PrecioUnitarioAnterior=v.PrecioUnitarioAnterior,
 DiferenciaPrecio=v.DiferenciaPrecio,PorcentajeCambioPrecio=v.PorcentajeCambioPrecio,TendenciaPrecio=v.TendenciaPrecio
 FROM dbo.Compras c JOIN dbo.vw_ComprasAnalisis v ON v.IdCompra=c.IdCompra
 WHERE c.IdProducto=@IdProducto AND c.IdPresentacionProducto=@IdPresentacionProducto AND c.Moneda=@Moneda;
 UPDATE c SET IdCompraAnterior=v.IdCompraAnterior,PrecioUnitarioAnterior=v.PrecioUnitarioAnterior,DiferenciaPrecio=v.DiferenciaPrecio,PorcentajeCambioPrecio=v.PorcentajeCambioPrecio,TendenciaPrecio=v.TendenciaPrecio
 FROM dbo.Compras c JOIN dbo.vw_ComprasAnalisis v ON v.IdCompra=c.IdCompra
 WHERE c.IdProducto=@ProductoAnterior AND c.IdPresentacionProducto=@PresentacionAnterior AND c.Moneda=@MonedaAnterior;
 SELECT @IdCompra AS IdCompraActualizada;
 IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
 IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK; ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION CompraReal;
 THROW;
 END CATCH;
END;

GO
