/* Compras reales: modulo historico independiente de la recepcion de cotizaciones.
   Las lecturas recalculan antecedentes por moneda y orden fecha/id, sin confiar
   en columnas de tendencia guardadas por versiones antiguas. */
CREATE OR ALTER VIEW dbo.vw_ComprasAnalisis AS
WITH Ordenadas AS(
 SELECT c.IdCompra,c.IdProducto,c.IdProveedor,c.IdPresentacionProducto,c.FechaCompra,c.CantidadComprada,c.PrecioTotal,c.Moneda,c.Observaciones,c.FechaCreacion,c.FechaModificacion,
 CONVERT(decimal(18,6),c.PrecioTotal/NULLIF(c.CantidadComprada,0)) AS PrecioUnitarioCalculado,
 LAG(c.IdCompra) OVER(PARTITION BY c.IdProducto,c.IdPresentacionProducto,c.Moneda ORDER BY c.FechaCompra,c.IdCompra) AS IdCompraAnterior,
 LAG(CONVERT(decimal(18,6),c.PrecioTotal/NULLIF(c.CantidadComprada,0))) OVER(PARTITION BY c.IdProducto,c.IdPresentacionProducto,c.Moneda ORDER BY c.FechaCompra,c.IdCompra) AS PrecioUnitarioAnterior
 FROM dbo.Compras c
)
SELECT o.*,p.Nombre AS NombreProducto,p.Categoria,p.Marca,pr.Nombre AS NombreProveedor,pr.EsProveedorAutorizado,
 pp.Descripcion AS NombrePresentacion,pp.Cantidad AS ContenidoEmpaque,pp.CantidadNormalizada,u.Codigo AS CodigoUnidad,u.Nombre AS NombreUnidadMedida,u.TipoBase,
 CONVERT(decimal(28,8),o.PrecioTotal/NULLIF(CONVERT(decimal(28,6),o.CantidadComprada*pp.CantidadNormalizada),0)) AS PrecioPorUnidadBase,
 CONVERT(decimal(18,6),o.PrecioUnitarioCalculado-o.PrecioUnitarioAnterior) AS DiferenciaPrecio,
 CONVERT(decimal(18,6),100.0*(o.PrecioUnitarioCalculado-o.PrecioUnitarioAnterior)/NULLIF(o.PrecioUnitarioAnterior,0)) AS PorcentajeCambioPrecio,
 CONVERT(nvarchar(30),CASE WHEN o.IdCompraAnterior IS NULL THEN 'PRIMER_REGISTRO' WHEN o.PrecioUnitarioAnterior=0 THEN 'NO_COMPARABLE'
 WHEN o.PrecioUnitarioCalculado>o.PrecioUnitarioAnterior THEN 'AUMENTO' WHEN o.PrecioUnitarioCalculado<o.PrecioUnitarioAnterior THEN 'DISMINUCION' ELSE 'SIN_CAMBIO' END) AS TendenciaPrecio
FROM Ordenadas o JOIN dbo.Productos p ON p.IdProducto=o.IdProducto JOIN dbo.Proveedores pr ON pr.IdProveedor=o.IdProveedor
JOIN dbo.PresentacionesProducto pp ON pp.IdPresentacionProducto=o.IdPresentacionProducto JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=pp.IdUnidadMedida;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Compra_Insertar @IdProducto int,@IdProveedor int,@IdPresentacionProducto int,@FechaCompra date,@CantidadComprada decimal(18,4),@PrecioTotal decimal(18,4),@Moneda nvarchar(10),@Observaciones nvarchar(500)=NULL AS
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
 INSERT dbo.Compras(IdProducto,IdProveedor,IdPresentacionProducto,FechaCompra,CantidadComprada,PrecioTotal,Moneda,PrecioUnitarioCalculado,Observaciones)
 VALUES(@IdProducto,@IdProveedor,@IdPresentacionProducto,@FechaCompra,@CantidadComprada,@PrecioTotal,@Moneda,@Precio,NULLIF(LTRIM(RTRIM(@Observaciones)),N''));
 DECLARE @Id bigint=CONVERT(bigint,SCOPE_IDENTITY());
 /* Cache de compatibilidad; todas las lecturas usan la vista recalculada. */
 UPDATE c SET PrecioUnitarioCalculado=v.PrecioUnitarioCalculado,IdCompraAnterior=v.IdCompraAnterior,PrecioUnitarioAnterior=v.PrecioUnitarioAnterior,
 DiferenciaPrecio=v.DiferenciaPrecio,PorcentajeCambioPrecio=v.PorcentajeCambioPrecio,TendenciaPrecio=v.TendenciaPrecio
 FROM dbo.Compras c JOIN dbo.vw_ComprasAnalisis v ON v.IdCompra=c.IdCompra
 WHERE c.IdProducto=@IdProducto AND c.IdPresentacionProducto=@IdPresentacionProducto AND c.Moneda=@Moneda;
 SELECT @Id AS IdCompraInsertada;
 IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
 IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK; ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION CompraReal;
 THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Compra_Actualizar @IdCompra bigint,@IdProducto int,@IdProveedor int,@IdPresentacionProducto int,@FechaCompra date,@CantidadComprada decimal(18,4),@PrecioTotal decimal(18,4),@Moneda nvarchar(10),@Observaciones nvarchar(500)=NULL AS
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
CREATE OR ALTER PROCEDURE dbo.SP_CompraAutomatica_InsertarCompraDesdeProforma @IdProducto int,@IdProveedor int,@IdPresentacionProducto int,@FechaCompra date,@CantidadComprada decimal(18,4),@PrecioTotal decimal(18,4),@Moneda nvarchar(10),@Observaciones nvarchar(500)=NULL AS
BEGIN
 SET NOCOUNT ON;
 THROW 52010,N'Una cotizacion recibida no es una compra. Use usp_Proforma_GuardarBorrador y valide la respuesta; registre una compra real por separado.',1;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Compra_Listar @Moneda nvarchar(10)=NULL,@Pagina int=1,@TamanoPagina int=50 AS
BEGIN
 SET NOCOUNT ON;
 IF @Pagina IS NULL OR @Pagina<1 OR @TamanoPagina IS NULL OR @TamanoPagina NOT BETWEEN 1 AND 200 THROW 52000,N'Paginacion invalida.',1;
 SELECT *,COUNT_BIG(*) OVER() AS TotalRegistros FROM dbo.vw_ComprasAnalisis WHERE @Moneda IS NULL OR Moneda=@Moneda
 ORDER BY FechaCompra DESC,IdCompra DESC OFFSET CONVERT(bigint,@Pagina-1)*@TamanoPagina ROWS FETCH NEXT @TamanoPagina ROWS ONLY;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Compra_ObtenerPorId @IdCompra bigint AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Compras WHERE IdCompra=@IdCompra) THROW 52004,N'Compra no existe.',1;
 SELECT * FROM dbo.vw_ComprasAnalisis WHERE IdCompra=@IdCompra;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Compra_HistorialPorProducto @IdProducto int,@Moneda nvarchar(10)=NULL AS
BEGIN
 SET NOCOUNT ON;
 SELECT * FROM dbo.vw_ComprasAnalisis WHERE IdProducto=@IdProducto AND (@Moneda IS NULL OR Moneda=@Moneda) ORDER BY FechaCompra DESC,IdCompra DESC;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Compra_HistorialPreciosPorProducto @IdProducto int,@IdPresentacionProducto int,@Moneda nvarchar(10) AS
BEGIN
 SET NOCOUNT ON;
 IF @Moneda IS NULL OR @Moneda NOT IN(N'CRC',N'USD') THROW 52000,N'Indique una moneda CRC o USD para comparar compras.',1; SELECT * FROM dbo.vw_ComprasAnalisis WHERE IdProducto=@IdProducto AND IdPresentacionProducto=@IdPresentacionProducto AND Moneda=@Moneda ORDER BY FechaCompra DESC,IdCompra DESC;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Compra_UltimoPrecio @IdProducto int,@IdPresentacionProducto int,@Moneda nvarchar(10) AS
BEGIN
 SET NOCOUNT ON;
 IF @Moneda IS NULL OR @Moneda NOT IN(N'CRC',N'USD') THROW 52000,N'Indique una moneda CRC o USD para comparar compras.',1; SELECT TOP(1) * FROM dbo.vw_ComprasAnalisis WHERE IdProducto=@IdProducto AND IdPresentacionProducto=@IdPresentacionProducto AND Moneda=@Moneda ORDER BY FechaCompra DESC,IdCompra DESC;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Compra_AlertasPorProducto @IdProducto int,@IdPresentacionProducto int,@Moneda nvarchar(10) AS
BEGIN
 SET NOCOUNT ON;
 IF @Moneda IS NULL OR @Moneda NOT IN(N'CRC',N'USD') THROW 52000,N'Indique una moneda CRC o USD para comparar compras.',1; SELECT *,CONVERT(bit,CASE WHEN PorcentajeCambioPrecio>=10 THEN 1 ELSE 0 END) AS AumentoMayorOIgual10PorCiento
 FROM dbo.vw_ComprasAnalisis WHERE IdProducto=@IdProducto AND IdPresentacionProducto=@IdPresentacionProducto AND Moneda=@Moneda ORDER BY FechaCompra DESC,IdCompra DESC;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Compra_ResumenInteligentePrecios @IdProducto int,@IdPresentacionProducto int,@Moneda nvarchar(10) AS
BEGIN
 SET NOCOUNT ON;
 IF @Moneda IS NULL OR @Moneda NOT IN(N'CRC',N'USD') THROW 52000,N'Indique una moneda CRC o USD para comparar compras.',1;
 SELECT IdProducto,IdPresentacionProducto,Moneda,COUNT_BIG(*) AS CantidadCompras,AVG(PrecioUnitarioCalculado) AS PrecioPromedioHistorico,
 MIN(PrecioUnitarioCalculado) AS PrecioMinimoHistorico,MAX(PrecioUnitarioCalculado) AS PrecioMaximoHistorico,
 MIN(FechaCompra) AS FechaPrimeraCompra,MAX(FechaCompra) AS FechaUltimaCompra FROM dbo.vw_ComprasAnalisis WHERE IdProducto=@IdProducto AND IdPresentacionProducto=@IdPresentacionProducto AND Moneda=@Moneda GROUP BY IdProducto,IdPresentacionProducto,Moneda;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Compra_EvaluarCompra @IdCompra bigint AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Compras WHERE IdCompra=@IdCompra) THROW 52004,N'Compra no existe.',1;
 SELECT a.*,h.CantidadComprasHistoricas,h.PrecioPromedioHistorico,
 a.PrecioUnitarioCalculado-h.PrecioPromedioHistorico AS DiferenciaVsPromedioHistorico
 FROM dbo.vw_ComprasAnalisis a OUTER APPLY(SELECT COUNT_BIG(*) AS CantidadComprasHistoricas,AVG(v.PrecioUnitarioCalculado) AS PrecioPromedioHistorico
 FROM dbo.vw_ComprasAnalisis v WHERE v.IdProducto=a.IdProducto AND v.IdPresentacionProducto=a.IdPresentacionProducto AND v.Moneda=a.Moneda
 AND (v.FechaCompra<a.FechaCompra OR (v.FechaCompra=a.FechaCompra AND v.IdCompra<a.IdCompra)))h WHERE a.IdCompra=@IdCompra;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_ComparadorProveedor_ObtenerComparativa @IdProducto int,@IdPresentacionProducto int,@Moneda nvarchar(10),@MesesAnalisis int=NULL,@SoloAutorizados bit=0 AS
BEGIN
 SET NOCOUNT ON;
 IF @Moneda IS NULL OR @Moneda NOT IN(N'CRC',N'USD') THROW 52000,N'Indique una moneda CRC o USD para comparar compras.',1;
 IF @MesesAnalisis IS NOT NULL AND @MesesAnalisis NOT BETWEEN 1 AND 1200 THROW 52000,N'Meses de analisis fuera de rango.',1;
 WITH Filtradas AS(SELECT *,ROW_NUMBER() OVER(PARTITION BY IdProveedor ORDER BY FechaCompra DESC,IdCompra DESC) AS rn FROM dbo.vw_ComprasAnalisis
 WHERE IdProducto=@IdProducto AND IdPresentacionProducto=@IdPresentacionProducto AND Moneda=@Moneda AND (@MesesAnalisis IS NULL OR FechaCompra>=DATEADD(month,-@MesesAnalisis,CONVERT(date,GETDATE()))) AND (@SoloAutorizados=0 OR EsProveedorAutorizado=1))
 SELECT IdProveedor,MAX(NombreProveedor) AS NombreProveedor,Moneda,COUNT_BIG(*) AS CantidadCompras,AVG(PrecioUnitarioCalculado) AS PromedioHistorico,
 MIN(PrecioUnitarioCalculado) AS PrecioMinimoHistorico,MAX(PrecioUnitarioCalculado) AS PrecioMaximoHistorico,
 MAX(FechaCompra) AS FechaUltimaCompra,MAX(CASE WHEN rn=1 THEN PrecioUnitarioCalculado END) AS UltimoPrecioUnitario
 FROM Filtradas GROUP BY IdProveedor,Moneda ORDER BY UltimoPrecioUnitario,IdProveedor;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_ComparadorProveedor_ObtenerDetalleHistoricoProveedor @IdProducto int,@IdPresentacionProducto int,@IdProveedor int,@Moneda nvarchar(10),@MesesAnalisis int=NULL AS
BEGIN
 SET NOCOUNT ON;
 IF @Moneda IS NULL OR @Moneda NOT IN(N'CRC',N'USD') THROW 52000,N'Indique una moneda CRC o USD para comparar compras.',1;
 IF @MesesAnalisis IS NOT NULL AND @MesesAnalisis NOT BETWEEN 1 AND 1200 THROW 52000,N'Meses de analisis fuera de rango.',1;
 SELECT * FROM dbo.vw_ComprasAnalisis WHERE IdProducto=@IdProducto AND IdPresentacionProducto=@IdPresentacionProducto AND Moneda=@Moneda AND IdProveedor=@IdProveedor
 AND (@MesesAnalisis IS NULL OR FechaCompra>=DATEADD(month,-@MesesAnalisis,CONVERT(date,GETDATE()))) ORDER BY FechaCompra DESC,IdCompra DESC;
END;
GO
