
CREATE   PROCEDURE dbo.usp_Proforma_Conciliar
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
