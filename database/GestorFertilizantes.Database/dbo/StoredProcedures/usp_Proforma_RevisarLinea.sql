
CREATE   PROCEDURE dbo.usp_Proforma_RevisarLinea
 @IdProformaProveedorDetalle int,@Motivo nvarchar(1000)=NULL
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON; DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCotizacion;
 BEGIN TRY
 DECLARE @MotivoPrevio sql_variant=SESSION_CONTEXT(N'MotivoCambio');
 EXEC sys.sp_set_session_context @key=N'MotivoCambio',@value=@Motivo;
 BEGIN TRY

 DECLARE @IdProformaProveedor int=(SELECT IdProformaProveedor FROM dbo.ProformasProveedorDetalle WHERE IdProformaProveedorDetalle=@IdProformaProveedorDetalle);
 IF NOT EXISTS(SELECT 1 FROM dbo.ProformasProveedor WITH(UPDLOCK,HOLDLOCK) WHERE IdProformaProveedor=@IdProformaProveedor AND Estado IN('Borrador','EnRevision')) THROW 52010,N'La respuesta no existe o esta finalizada.',1;
 IF EXISTS(SELECT 1 FROM dbo.ProformasProveedorDetalle d LEFT JOIN dbo.Productos p ON p.IdProducto=d.IdProducto
 LEFT JOIN dbo.ProductosBase b ON b.IdProductoBase=p.IdProductoBase LEFT JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca
 LEFT JOIN dbo.PresentacionesProducto pp ON pp.IdPresentacionProducto=d.IdPresentacionProducto LEFT JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=d.IdUnidadMedidaOriginal
 WHERE d.IdProformaProveedorDetalle=@IdProformaProveedorDetalle AND d.EstadoOferta='Cotizada' AND
 (p.IdProducto IS NULL OR p.Activo<>1 OR b.Activo<>1 OR (p.IdMarca IS NOT NULL AND m.Activo<>1) OR pp.IdPresentacionProducto IS NULL OR pp.Activo<>1 OR u.IdUnidadMedida IS NULL OR u.Activo<>1))
 THROW 52000,N'La oferta cotizada requiere un catalogo activo completo.',1;
 UPDATE dbo.ProformasProveedorDetalle SET EstadoRevision='Revisada',ProductoEncontrado=CASE WHEN IdProducto IS NULL THEN 0 ELSE 1 END,
 PresentacionEncontrada=CASE WHEN IdPresentacionProducto IS NULL THEN 0 ELSE 1 END,
 SePuedeRegistrar=CASE WHEN EstadoOferta='Cotizada' AND IdProducto IS NOT NULL AND IdPresentacionProducto IS NOT NULL THEN 1 ELSE 0 END,
 FechaModificacion=SYSUTCDATETIME() WHERE IdProformaProveedorDetalle=@IdProformaProveedorDetalle;

 EXEC sys.sp_set_session_context @key=N'MotivoCambio',@value=@MotivoPrevio;
 END TRY BEGIN CATCH
 EXEC sys.sp_set_session_context @key=N'MotivoCambio',@value=@MotivoPrevio; THROW;
 END CATCH;
 IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
 IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK; ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCotizacion;
 THROW; END CATCH;
END;

GO
