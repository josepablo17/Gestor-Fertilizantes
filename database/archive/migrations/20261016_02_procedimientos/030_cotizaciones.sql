CREATE OR ALTER PROCEDURE dbo.usp_Proforma_AgregarLinea
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
CREATE OR ALTER PROCEDURE dbo.usp_Proforma_ActualizarLinea
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
CREATE OR ALTER PROCEDURE dbo.usp_Proforma_ActualizarCabecera
 @IdProformaProveedor int,@CabeceraJson nvarchar(max),@Motivo nvarchar(1000)
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON; DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCotizacion;
 BEGIN TRY
 DECLARE @MotivoPrevio sql_variant=SESSION_CONTEXT(N'MotivoCambio');
 EXEC sys.sp_set_session_context @key=N'MotivoCambio',@value=@Motivo;
 BEGIN TRY

 IF ISNULL(ISJSON(@CabeceraJson,OBJECT),0)<>1 THROW 52000,N'Cabecera debe ser un objeto JSON.',1;
 EXEC dbo.usp_Proforma_ComprobarJson @CabeceraJson,NULL;
 IF NULLIF(LTRIM(RTRIM(@Motivo)),N'') IS NULL THROW 52000,N'El motivo del ajuste es obligatorio.',1;
 IF JSON_VALUE(@CabeceraJson,'$.moneda') IS NOT NULL AND
 (LEN(JSON_VALUE(@CabeceraJson,'$.moneda'))<>3 OR JSON_VALUE(@CabeceraJson,'$.moneda') COLLATE Latin1_General_100_BIN2 LIKE '%[^A-Z]%') THROW 52000,N'Moneda invalida.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.ProformasProveedor WITH(UPDLOCK,HOLDLOCK) WHERE IdProformaProveedor=@IdProformaProveedor AND Estado IN('Borrador','EnRevision')) THROW 52010,N'La respuesta no existe o esta finalizada.',1;
 UPDATE p SET NumeroProforma=j.NumeroProforma,FechaProforma=j.FechaProforma,FechaVencimiento=j.FechaVencimiento,DiasCredito=j.DiasCredito,TipoDocumento=j.TipoDocumento,Moneda=j.Moneda,NombreProveedorPdf=j.NombreProveedorPdf,NombreNegocio=j.NombreNegocio,RazonSocial=j.RazonSocial,Cedula=j.Cedula,Telefono=j.Telefono,Vendedor=j.Vendedor,Subtotal=j.Subtotal,Descuento=j.Descuento,IVA=j.IVA,Total=j.Total,OtrosCargos=j.OtrosCargos,DatosProveedorOriginalJson=j.DatosProveedorOriginalJson,DatosClienteOriginalJson=j.DatosClienteOriginalJson,CondicionesPago=j.CondicionesPago,CondicionesEntrega=j.CondicionesEntrega,Observaciones=j.Observaciones,EstadoConciliacion='Pendiente',JustificacionConciliacion=NULL,FechaModificacion=SYSUTCDATETIME()
 FROM dbo.ProformasProveedor p CROSS APPLY OPENJSON(@CabeceraJson) WITH(NumeroProforma nvarchar(50) '$.numeroProforma' ,FechaProforma date '$.fechaProforma' ,FechaVencimiento date '$.fechaVencimiento' ,DiasCredito int '$.diasCredito' ,TipoDocumento nvarchar(50) '$.tipoDocumento' ,Moneda char(3) '$.moneda' ,NombreProveedorPdf nvarchar(200) '$.nombreProveedorPdf' ,NombreNegocio nvarchar(250) '$.nombreNegocio' ,RazonSocial nvarchar(250) '$.razonSocial' ,Cedula nvarchar(50) '$.cedula' ,Telefono nvarchar(50) '$.telefono' ,Vendedor nvarchar(150) '$.vendedor' ,Subtotal decimal(18,4) '$.subtotal' ,Descuento decimal(18,4) '$.descuento' ,IVA decimal(18,4) '$.iva' ,Total decimal(18,4) '$.total' ,OtrosCargos decimal(18,4) '$.otrosCargos' ,DatosProveedorOriginalJson nvarchar(max) '$.datosProveedorOriginal' AS JSON,DatosClienteOriginalJson nvarchar(max) '$.datosClienteOriginal' AS JSON,CondicionesPago nvarchar(1000) '$.condicionesPago' ,CondicionesEntrega nvarchar(1000) '$.condicionesEntrega' ,Observaciones nvarchar(2000) '$.observaciones' )j
 WHERE p.IdProformaProveedor=@IdProformaProveedor;

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
CREATE OR ALTER PROCEDURE dbo.usp_Proforma_RevisarLinea
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
CREATE OR ALTER PROCEDURE dbo.usp_Proforma_Conciliar
 @IdProformaProveedor int,@EstadoConciliacion varchar(20),@Motivo nvarchar(1000),@Tolerancia decimal(18,4)=0.01
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON; DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCotizacion;
 BEGIN TRY
 DECLARE @MotivoPrevio sql_variant=SESSION_CONTEXT(N'MotivoCambio');
 EXEC sys.sp_set_session_context @key=N'MotivoCambio',@value=@Motivo;
 BEGIN TRY

 IF NOT EXISTS(SELECT 1 FROM dbo.ProformasProveedor WITH(UPDLOCK,HOLDLOCK) WHERE IdProformaProveedor=@IdProformaProveedor AND Estado IN('Borrador','EnRevision')) THROW 52010,N'La respuesta no existe o esta finalizada.',1;
 IF @EstadoConciliacion IS NULL OR @EstadoConciliacion NOT IN('Conciliada','ConDiferencias') THROW 52000,N'Estado de conciliacion invalido.',1;
 IF NULLIF(LTRIM(RTRIM(@Motivo)),N'') IS NULL THROW 52000,N'Documente la revision de importes.',1;
 IF @Tolerancia IS NULL OR @Tolerancia<0 OR @Tolerancia>1 THROW 52000,N'Tolerancia fuera del rango 0 a 1.',1;
 IF EXISTS(SELECT 1 FROM dbo.ProformasProveedor WHERE IdProformaProveedor=@IdProformaProveedor AND
 (Subtotal IS NULL OR Descuento IS NULL OR IVA IS NULL OR Total IS NULL OR OtrosCargos IS NULL)) THROW 52000,N'Complete los importes de cabecera; no se asumen ceros.',1;
 IF @EstadoConciliacion='Conciliada' AND EXISTS(SELECT 1 FROM dbo.ProformasProveedor WHERE IdProformaProveedor=@IdProformaProveedor
 AND ABS(Total-(Subtotal-Descuento+IVA+OtrosCargos))>@Tolerancia)
 THROW 52000,N'La cabecera no cuadra dentro de la tolerancia. Revise los importes o justifique las diferencias.',1;
 DECLARE @MotivoRegistro nvarchar(1000)=LEFT(CONCAT(N'Tolerancia=',CONVERT(nvarchar(40),@Tolerancia),N'; ',@Motivo),1000);
 EXEC sys.sp_set_session_context @key=N'MotivoCambio',@value=@MotivoRegistro;
 UPDATE dbo.ProformasProveedor SET EstadoConciliacion=@EstadoConciliacion,JustificacionConciliacion=@MotivoRegistro,FechaModificacion=SYSUTCDATETIME() WHERE IdProformaProveedor=@IdProformaProveedor;

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
CREATE OR ALTER PROCEDURE dbo.usp_Proforma_CancelarBorrador
 @IdProformaProveedor int,@Motivo nvarchar(1000)
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON; DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCotizacion;
 BEGIN TRY
 DECLARE @MotivoPrevio sql_variant=SESSION_CONTEXT(N'MotivoCambio');
 EXEC sys.sp_set_session_context @key=N'MotivoCambio',@value=@Motivo;
 BEGIN TRY

 IF NOT EXISTS(SELECT 1 FROM dbo.ProformasProveedor WITH(UPDLOCK,HOLDLOCK) WHERE IdProformaProveedor=@IdProformaProveedor AND Estado IN('Borrador','EnRevision')) THROW 52010,N'La respuesta no existe o esta finalizada.',1;
 IF NULLIF(LTRIM(RTRIM(@Motivo)),N'') IS NULL THROW 52000,N'El motivo de cancelacion es obligatorio.',1;
 UPDATE dbo.ProformasProveedor SET Estado='Cancelada',FechaModificacion=SYSUTCDATETIME() WHERE IdProformaProveedor=@IdProformaProveedor;

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
CREATE OR ALTER PROCEDURE dbo.usp_Proforma_HistorialCambios
 @IdProformaProveedor int
AS
BEGIN
 SET NOCOUNT ON;
IF NOT EXISTS(SELECT 1 FROM dbo.ProformasProveedor WHERE IdProformaProveedor=@IdProformaProveedor) THROW 52004,N'Cotizacion no existe.',1;
 SELECT * FROM dbo.CambiosCotizacion WHERE IdProformaProveedor=@IdProformaProveedor ORDER BY FechaCambio,IdCambioCotizacion;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_ProformaProveedor_Insertar
 @IdSolicitudCotizacionProveedor bigint,@IdDocumentoOrigen bigint,@IdImportacionDocumento bigint=NULL,@CabeceraJson nvarchar(max),@LineasJson nvarchar(max),@IdProformaProveedor int OUTPUT
AS
BEGIN
 SET NOCOUNT ON;

 EXEC dbo.usp_Proforma_GuardarBorrador @IdSolicitudCotizacionProveedor,@IdDocumentoOrigen,@IdImportacionDocumento,@CabeceraJson,@LineasJson,@IdProformaProveedor OUTPUT;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_ProformaProveedorDetalle_Insertar
 @IdProformaProveedor int,@LineaJson nvarchar(max),@Motivo nvarchar(1000),@IdProformaProveedorDetalle int OUTPUT
AS
BEGIN
 SET NOCOUNT ON;

 EXEC dbo.usp_Proforma_AgregarLinea @IdProformaProveedor,@LineaJson,@Motivo,@IdProformaProveedorDetalle OUTPUT;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_ProformaProveedor_Listar
 @IdSolicitudCotizacion bigint=NULL,@IdProveedor int=NULL,@Estado varchar(30)=NULL,@Pagina int=1,@TamanoPagina int=50
AS
BEGIN
 SET NOCOUNT ON;

 IF @Pagina IS NULL OR @Pagina<1 OR @TamanoPagina IS NULL OR @TamanoPagina NOT BETWEEN 1 AND 200 THROW 52000,N'Paginacion invalida.',1;
 SELECT p.*,pr.Nombre AS NombreProveedor,s.NumeroSolicitud,s.VersionSolicitud,COUNT_BIG(*) OVER() AS TotalRegistros
 FROM dbo.ProformasProveedor p JOIN dbo.Proveedores pr ON pr.IdProveedor=p.IdProveedor JOIN dbo.SolicitudesCotizacion s ON s.IdSolicitudCotizacion=p.IdSolicitudCotizacion
 WHERE (@IdSolicitudCotizacion IS NULL OR p.IdSolicitudCotizacion=@IdSolicitudCotizacion) AND (@IdProveedor IS NULL OR p.IdProveedor=@IdProveedor) AND (@Estado IS NULL OR p.Estado=@Estado)
 ORDER BY p.FechaCreacion DESC,p.IdProformaProveedor DESC OFFSET CONVERT(bigint,@Pagina-1)*@TamanoPagina ROWS FETCH NEXT @TamanoPagina ROWS ONLY;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_ProformaProveedorDetalle_ListarPorProforma
 @IdProformaProveedor int
AS
BEGIN
 SET NOCOUNT ON;

 IF NOT EXISTS(SELECT 1 FROM dbo.ProformasProveedor WHERE IdProformaProveedor=@IdProformaProveedor) THROW 52004,N'Cotizacion no existe.',1;
 SELECT d.*,d.NombreProductoOriginal AS NombreProducto,d.PresentacionOriginal AS DescripcionPresentacion,
 CONVERT(decimal(28,6),d.Cantidad*d.ContenidoNormalizadoOriginal) AS ContenidoTotalNormalizado
 FROM dbo.ProformasProveedorDetalle d WHERE d.IdProformaProveedor=@IdProformaProveedor ORDER BY CASE WHEN d.NumeroLineaDocumento IS NULL THEN 1 ELSE 0 END,d.NumeroLineaDocumento,d.IdProformaProveedorDetalle;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_ProformaProveedor_ObtenerPorId
 @IdProformaProveedor int
AS
BEGIN
 SET NOCOUNT ON;

 IF NOT EXISTS(SELECT 1 FROM dbo.ProformasProveedor WHERE IdProformaProveedor=@IdProformaProveedor) THROW 52004,N'Cotizacion no existe.',1;
 SELECT p.*,pr.Nombre AS NombreProveedor,s.NumeroSolicitud,s.VersionSolicitud,doc.NombreOriginal AS NombreArchivo,doc.RutaAlmacenamiento,doc.Sha256
 FROM dbo.ProformasProveedor p JOIN dbo.Proveedores pr ON pr.IdProveedor=p.IdProveedor JOIN dbo.SolicitudesCotizacion s ON s.IdSolicitudCotizacion=p.IdSolicitudCotizacion
 LEFT JOIN dbo.Documentos doc ON doc.IdDocumento=p.IdDocumentoOrigen WHERE p.IdProformaProveedor=@IdProformaProveedor;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Proforma_ObtenerCompleta
 @IdProformaProveedor int
AS
BEGIN
 SET NOCOUNT ON;

 EXEC dbo.SP_ProformaProveedor_ObtenerPorId @IdProformaProveedor;
 EXEC dbo.SP_ProformaProveedorDetalle_ListarPorProforma @IdProformaProveedor;
 EXEC dbo.usp_Proforma_HistorialCambios @IdProformaProveedor;
END;
GO
