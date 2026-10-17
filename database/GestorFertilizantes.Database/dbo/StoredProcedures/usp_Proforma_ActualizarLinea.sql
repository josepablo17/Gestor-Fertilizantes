
CREATE   PROCEDURE dbo.usp_Proforma_ActualizarLinea
 @IdProformaProveedorDetalle int,@LineaJson nvarchar(max),@Motivo nvarchar(1000)
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON; DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCotizacion;
 BEGIN TRY
 DECLARE @MotivoPrevio sql_variant=SESSION_CONTEXT(N'MotivoCambio');
 EXEC sys.sp_set_session_context @key=N'MotivoCambio',@value=@Motivo;
 BEGIN TRY

 IF ISNULL(ISJSON(@LineaJson,OBJECT),0)<>1 THROW 52000,N'Linea debe ser un objeto JSON.',1;
 DECLARE @ArrayLinea nvarchar(max)=N'['+@LineaJson+N']'; EXEC dbo.usp_Proforma_ComprobarJson NULL,@ArrayLinea;
 IF NULLIF(LTRIM(RTRIM(@Motivo)),N'') IS NULL THROW 52000,N'El motivo del ajuste es obligatorio.',1;
 DECLARE @IdProformaProveedor int=(SELECT IdProformaProveedor FROM dbo.ProformasProveedorDetalle WHERE IdProformaProveedorDetalle=@IdProformaProveedorDetalle);
 IF NOT EXISTS(SELECT 1 FROM dbo.ProformasProveedor WITH(UPDLOCK,HOLDLOCK) WHERE IdProformaProveedor=@IdProformaProveedor AND Estado IN('Borrador','EnRevision')) THROW 52010,N'La respuesta no existe o esta finalizada.',1;
 UPDATE d SET IdSolicitudCotizacionDetalle=j.IdSolicitudCotizacionDetalle,NumeroLineaDocumento=j.NumeroLineaDocumento,CodigoProveedor=j.CodigoProveedor,DescripcionProveedor=j.DescripcionProveedor,IdProducto=j.IdProducto,IdPresentacionProducto=j.IdPresentacionProducto,Cantidad=j.Cantidad,PrecioUnitario=j.PrecioUnitario,DescuentoPorcentaje=j.DescuentoPorcentaje,TotalLinea=j.TotalLinea,TipoOferta=COALESCE(j.TipoOferta,'Solicitada'),EstadoOferta=COALESCE(j.EstadoOferta,'Cotizada'),NombreProductoOriginal=j.NombreProductoOriginal,MarcaOriginal=j.MarcaOriginal,PresentacionOriginal=j.PresentacionOriginal,ContenidoEmpaqueOriginal=j.ContenidoEmpaqueOriginal,IdUnidadMedidaOriginal=j.IdUnidadMedidaOriginal,CodigoUnidadOriginal=j.CodigoUnidadOriginal,TipoBaseOriginal=j.TipoBaseOriginal,FactorConversionOriginal=j.FactorConversionOriginal,ContenidoNormalizadoOriginal=j.ContenidoNormalizadoOriginal,DescuentoMonto=j.DescuentoMonto,ImpuestoMonto=j.ImpuestoMonto,BaseTotalLinea=COALESCE(j.BaseTotalLinea,'SinDefinir'),MotivoAlternativa=j.MotivoAlternativa,ObservacionValidacion=j.ObservacionValidacion,EstadoRevision='Pendiente',ProductoEncontrado=0,PresentacionEncontrada=0,SePuedeRegistrar=0,FechaModificacion=SYSUTCDATETIME()
 FROM dbo.ProformasProveedorDetalle d CROSS APPLY OPENJSON(@LineaJson) WITH(IdSolicitudCotizacionDetalle bigint '$.idSolicitudDetalle',
NumeroLineaDocumento int '$.numeroLinea',
CodigoProveedor nvarchar(100) '$.codigo',
DescripcionProveedor nvarchar(500) '$.descripcion',
IdProducto int '$.idProducto',
IdPresentacionProducto int '$.idPresentacionProducto',
Cantidad decimal(18,4) '$.cantidadEmpaques',
PrecioUnitario decimal(18,6) '$.precioUnitario',
DescuentoPorcentaje decimal(5,2) '$.descuentoPorcentaje',
TotalLinea decimal(18,4) '$.totalLinea',
TipoOferta varchar(20) '$.tipoOferta',
EstadoOferta varchar(20) '$.estadoOferta',
NombreProductoOriginal nvarchar(150) '$.nombreProductoOriginal',
MarcaOriginal nvarchar(150) '$.marcaOriginal',
PresentacionOriginal nvarchar(150) '$.presentacionOriginal',
ContenidoEmpaqueOriginal decimal(18,6) '$.contenidoEmpaqueOriginal',
IdUnidadMedidaOriginal int '$.idUnidadMedidaOriginal',
CodigoUnidadOriginal nvarchar(20) '$.codigoUnidadOriginal',
TipoBaseOriginal nvarchar(20) '$.tipoBaseOriginal',
FactorConversionOriginal decimal(18,6) '$.factorConversionOriginal',
ContenidoNormalizadoOriginal decimal(18,6) '$.contenidoNormalizadoOriginal',
DescuentoMonto decimal(18,4) '$.descuentoMonto',
ImpuestoMonto decimal(18,4) '$.impuestoMonto',
BaseTotalLinea varchar(30) '$.baseTotalLinea',
MotivoAlternativa nvarchar(1000) '$.motivoAlternativa',
ObservacionValidacion nvarchar(1000) '$.observacion')j
 WHERE d.IdProformaProveedorDetalle=@IdProformaProveedorDetalle;
 UPDATE dbo.ProformasProveedor SET EstadoConciliacion='Pendiente',JustificacionConciliacion=NULL,FechaModificacion=SYSUTCDATETIME() WHERE IdProformaProveedor=@IdProformaProveedor;

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
