
CREATE   PROCEDURE dbo.usp_Proforma_AgregarLinea
 @IdProformaProveedor int,@LineaJson nvarchar(max),@Motivo nvarchar(1000),@IdProformaProveedorDetalle int OUTPUT
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
 IF NULLIF(LTRIM(RTRIM(@Motivo)),N'') IS NULL THROW 52000,N'Explique por que se agrega la linea.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.ProformasProveedor WITH(UPDLOCK,HOLDLOCK) WHERE IdProformaProveedor=@IdProformaProveedor AND Estado IN('Borrador','EnRevision')) THROW 52010,N'La respuesta no existe o esta finalizada.',1;
 DECLARE @Solicitud bigint=(SELECT IdSolicitudCotizacion FROM dbo.ProformasProveedor WHERE IdProformaProveedor=@IdProformaProveedor);
 INSERT dbo.ProformasProveedorDetalle(IdProformaProveedor,IdSolicitudCotizacion,IdSolicitudCotizacionDetalle,NumeroLineaDocumento,CodigoProveedor,DescripcionProveedor,IdProducto,IdPresentacionProducto,Cantidad,PrecioUnitario,DescuentoPorcentaje,TotalLinea,TipoOferta,EstadoOferta,NombreProductoOriginal,MarcaOriginal,PresentacionOriginal,ContenidoEmpaqueOriginal,IdUnidadMedidaOriginal,CodigoUnidadOriginal,TipoBaseOriginal,FactorConversionOriginal,ContenidoNormalizadoOriginal,DescuentoMonto,ImpuestoMonto,BaseTotalLinea,MotivoAlternativa,ObservacionValidacion)
 SELECT @IdProformaProveedor,@Solicitud,j.IdSolicitudCotizacionDetalle,j.NumeroLineaDocumento,j.CodigoProveedor,j.DescripcionProveedor,j.IdProducto,j.IdPresentacionProducto,j.Cantidad,j.PrecioUnitario,j.DescuentoPorcentaje,j.TotalLinea,COALESCE(j.TipoOferta,'Solicitada'),COALESCE(j.EstadoOferta,'Cotizada'),j.NombreProductoOriginal,j.MarcaOriginal,j.PresentacionOriginal,j.ContenidoEmpaqueOriginal,j.IdUnidadMedidaOriginal,j.CodigoUnidadOriginal,j.TipoBaseOriginal,j.FactorConversionOriginal,j.ContenidoNormalizadoOriginal,j.DescuentoMonto,j.ImpuestoMonto,COALESCE(j.BaseTotalLinea,'SinDefinir'),j.MotivoAlternativa,j.ObservacionValidacion FROM OPENJSON(@LineaJson) WITH(IdSolicitudCotizacionDetalle bigint '$.idSolicitudDetalle',
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
ObservacionValidacion nvarchar(1000) '$.observacion')j;
 SET @IdProformaProveedorDetalle=CONVERT(int,SCOPE_IDENTITY());
 INSERT dbo.CambiosCotizacion(IdProformaProveedor,IdProformaProveedorDetalle,Origen,CambiosJson,Motivo)
 SELECT @IdProformaProveedor,@IdProformaProveedorDetalle,'Manual',
 (SELECT CAST(NULL AS nvarchar(1)) AS antes,JSON_QUERY((SELECT d.* FOR JSON PATH,INCLUDE_NULL_VALUES,WITHOUT_ARRAY_WRAPPER)) AS despues
 FOR JSON PATH,INCLUDE_NULL_VALUES,WITHOUT_ARRAY_WRAPPER),@Motivo FROM dbo.ProformasProveedorDetalle d WHERE d.IdProformaProveedorDetalle=@IdProformaProveedorDetalle;
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
