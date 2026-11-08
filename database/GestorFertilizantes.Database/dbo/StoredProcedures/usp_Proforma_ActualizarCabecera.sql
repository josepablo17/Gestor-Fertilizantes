
CREATE   PROCEDURE dbo.usp_Proforma_ActualizarCabecera
 @IdProformaProveedor int,@CabeceraJson nvarchar(max),@Motivo nvarchar(1000)=NULL
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
 IF JSON_VALUE(@CabeceraJson,'$.moneda') IS NOT NULL AND
 (LEN(JSON_VALUE(@CabeceraJson,'$.moneda'))<>3 OR JSON_VALUE(@CabeceraJson,'$.moneda') COLLATE Latin1_General_100_BIN2 LIKE '%[^A-Z]%') THROW 52000,N'Moneda invalida.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.ProformasProveedor WITH(UPDLOCK,HOLDLOCK) WHERE IdProformaProveedor=@IdProformaProveedor AND Estado IN('Borrador','EnRevision')) THROW 52010,N'La respuesta no existe o esta finalizada.',1;
 DECLARE @CambioImportes bit,@CambioMoneda bit,@EstadoAnterior varchar(20);
 SELECT @EstadoAnterior=p.EstadoConciliacion,
  @CambioImportes=CASE WHEN EXISTS(
   SELECT p.Subtotal,p.Descuento,p.IVA,p.OtrosCargos,p.Total
   EXCEPT SELECT j.Subtotal,j.Descuento,j.IVA,j.OtrosCargos,j.Total) THEN 1 ELSE 0 END,
  @CambioMoneda=CASE WHEN p.Moneda IS NOT NULL AND EXISTS(
   SELECT p.Moneda EXCEPT SELECT j.Moneda) THEN 1 ELSE 0 END
 FROM dbo.ProformasProveedor p CROSS APPLY OPENJSON(@CabeceraJson)
 WITH(Moneda char(3) '$.moneda',Subtotal decimal(18,4) '$.subtotal',Descuento decimal(18,4) '$.descuento',
  IVA decimal(18,4) '$.iva',OtrosCargos decimal(18,4) '$.otrosCargos',Total decimal(18,4) '$.total')j
 WHERE p.IdProformaProveedor=@IdProformaProveedor;
 SET @Motivo=NULLIF(LTRIM(RTRIM(@Motivo)),N'');
 IF @EstadoAnterior<>'Pendiente' AND (@CambioImportes=1 OR @CambioMoneda=1) AND @Motivo IS NULL
  THROW 52000,N'Indique el motivo al corregir importes o moneda de una cabecera conciliada.',1;
 SET @Motivo=COALESCE(@Motivo,N'Captura o actualización de cabecera.');
 EXEC sys.sp_set_session_context @key=N'MotivoCambio',@value=@Motivo;
 UPDATE p SET NumeroProforma=j.NumeroProforma,FechaProforma=j.FechaProforma,FechaVencimiento=j.FechaVencimiento,DiasCredito=j.DiasCredito,TipoDocumento=j.TipoDocumento,Moneda=j.Moneda,NombreProveedorPdf=j.NombreProveedorPdf,NombreNegocio=j.NombreNegocio,RazonSocial=j.RazonSocial,Cedula=j.Cedula,Telefono=j.Telefono,Vendedor=j.Vendedor,Subtotal=j.Subtotal,Descuento=j.Descuento,IVA=j.IVA,Total=j.Total,OtrosCargos=j.OtrosCargos,DatosProveedorOriginalJson=j.DatosProveedorOriginalJson,DatosClienteOriginalJson=j.DatosClienteOriginalJson,CondicionesPago=j.CondicionesPago,CondicionesEntrega=j.CondicionesEntrega,Observaciones=j.Observaciones,EstadoConciliacion=c.Estado,
 JustificacionConciliacion=CASE WHEN @CambioImportes=0 AND @CambioMoneda=0 AND @EstadoAnterior<>'Pendiente'
  THEN p.JustificacionConciliacion
  WHEN c.Estado='Conciliada' THEN N'Tolerancia=0.0100; Comprobación automática de los importes de cabecera.'
  ELSE NULL END,FechaModificacion=SYSUTCDATETIME()
 FROM dbo.ProformasProveedor p CROSS APPLY OPENJSON(@CabeceraJson) WITH(NumeroProforma nvarchar(50) '$.numeroProforma' ,FechaProforma date '$.fechaProforma' ,FechaVencimiento date '$.fechaVencimiento' ,DiasCredito int '$.diasCredito' ,TipoDocumento nvarchar(50) '$.tipoDocumento' ,Moneda char(3) '$.moneda' ,NombreProveedorPdf nvarchar(200) '$.nombreProveedorPdf' ,NombreNegocio nvarchar(250) '$.nombreNegocio' ,RazonSocial nvarchar(250) '$.razonSocial' ,Cedula nvarchar(50) '$.cedula' ,Telefono nvarchar(50) '$.telefono' ,Vendedor nvarchar(150) '$.vendedor' ,Subtotal decimal(18,4) '$.subtotal' ,Descuento decimal(18,4) '$.descuento' ,IVA decimal(18,4) '$.iva' ,Total decimal(18,4) '$.total' ,OtrosCargos decimal(18,4) '$.otrosCargos' ,DatosProveedorOriginalJson nvarchar(max) '$.datosProveedorOriginal' AS JSON,DatosClienteOriginalJson nvarchar(max) '$.datosClienteOriginal' AS JSON,CondicionesPago nvarchar(1000) '$.condicionesPago' ,CondicionesEntrega nvarchar(1000) '$.condicionesEntrega' ,Observaciones nvarchar(2000) '$.observaciones' )j

 CROSS APPLY(SELECT CASE
  WHEN @CambioMoneda=1 THEN 'Pendiente'
  WHEN @CambioImportes=0 AND @EstadoAnterior<>'Pendiente' THEN @EstadoAnterior
  WHEN j.Moneda IS NOT NULL AND j.Subtotal IS NOT NULL AND j.Descuento IS NOT NULL AND j.IVA IS NOT NULL
   AND j.OtrosCargos IS NOT NULL AND j.Total IS NOT NULL
   AND ABS(j.Total-(j.Subtotal-j.Descuento+j.IVA+j.OtrosCargos))<=0.01 THEN 'Conciliada'
  ELSE 'Pendiente' END AS Estado)c
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
