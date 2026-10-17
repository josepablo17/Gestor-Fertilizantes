
CREATE   PROCEDURE dbo.usp_Proforma_ActualizarCabecera
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
