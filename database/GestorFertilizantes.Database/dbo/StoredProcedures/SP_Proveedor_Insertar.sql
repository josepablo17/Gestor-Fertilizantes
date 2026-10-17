
CREATE   PROCEDURE dbo.SP_Proveedor_Insertar
 @Nombre nvarchar(150),@Contacto nvarchar(150)=NULL,@Telefono nvarchar(50)=NULL,@Correo nvarchar(150)=NULL,@Direccion nvarchar(250)=NULL,@Provincia nvarchar(100)=NULL,@Canton nvarchar(100)=NULL,@Distrito nvarchar(100)=NULL,@FuenteExterna nvarchar(100)=NULL,@IdExterno nvarchar(100)=NULL,@TipoIdentificacion nvarchar(30)=NULL,@IdentificacionFiscal nvarchar(50)=NULL,@PaisIdentificacion char(2)=NULL,@EsProveedorAutorizado bit=0,@FechaUltimaSincronizacion datetime2(7)=NULL
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCatalogo;
 BEGIN TRY
IF NULLIF(LTRIM(RTRIM(@Nombre)),N'') IS NULL THROW 52000,N'Nombre es obligatorio.',1;
SET @Contacto=NULLIF(LTRIM(RTRIM(@Contacto)),N'');
SET @Telefono=NULLIF(LTRIM(RTRIM(@Telefono)),N'');
SET @Correo=NULLIF(LTRIM(RTRIM(@Correo)),N'');
SET @Direccion=NULLIF(LTRIM(RTRIM(@Direccion)),N'');
SET @Provincia=NULLIF(LTRIM(RTRIM(@Provincia)),N'');
SET @Canton=NULLIF(LTRIM(RTRIM(@Canton)),N'');
SET @Distrito=NULLIF(LTRIM(RTRIM(@Distrito)),N'');
SET @FuenteExterna=NULLIF(LTRIM(RTRIM(@FuenteExterna)),N'');
SET @IdExterno=NULLIF(LTRIM(RTRIM(@IdExterno)),N'');
SET @TipoIdentificacion=NULLIF(LTRIM(RTRIM(@TipoIdentificacion)),N'');
SET @IdentificacionFiscal=NULLIF(LTRIM(RTRIM(@IdentificacionFiscal)),N'');
IF @EsProveedorAutorizado IS NULL THROW 52000,N'EsProveedorAutorizado es obligatorio.',1;
INSERT dbo.Proveedores(Nombre,Contacto,Telefono,Correo,Direccion,Provincia,Canton,Distrito,FuenteExterna,IdExterno,TipoIdentificacion,IdentificacionFiscal,PaisIdentificacion,EsProveedorAutorizado,FechaUltimaSincronizacion)VALUES(@Nombre,@Contacto,@Telefono,@Correo,@Direccion,@Provincia,@Canton,@Distrito,@FuenteExterna,@IdExterno,@TipoIdentificacion,@IdentificacionFiscal,@PaisIdentificacion,@EsProveedorAutorizado,@FechaUltimaSincronizacion); SELECT CONVERT(int,SCOPE_IDENTITY()) AS IdProveedor;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;

GO
