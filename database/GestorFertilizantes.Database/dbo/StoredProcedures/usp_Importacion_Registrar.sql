
CREATE   PROCEDURE dbo.usp_Importacion_Registrar
 @IdDocumento bigint,@VersionLector nvarchar(50),@Metodo varchar(20),@Estado varchar(30),
 @DatosExtraidosJson nvarchar(max)=NULL,@AdvertenciasJson nvarchar(max)=NULL,@IdImportacionDocumento bigint OUTPUT
AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Documentos WHERE IdDocumento=@IdDocumento AND Origen='Recibido')
 THROW 52000,N'La importacion requiere un PDF recibido registrado.',1;
 IF NULLIF(LTRIM(RTRIM(@VersionLector)),N'') IS NULL THROW 52000,N'Version del lector obligatoria.',1;
 IF @DatosExtraidosJson IS NOT NULL AND ISJSON(@DatosExtraidosJson)<>1 THROW 52000,N'Datos de extraccion JSON invalidos.',1;
 IF @AdvertenciasJson IS NOT NULL AND ISJSON(@AdvertenciasJson)<>1 THROW 52000,N'Advertencias JSON invalidas.',1;
 INSERT dbo.ImportacionesDocumento(IdDocumento,VersionLector,Metodo,Estado,DatosExtraidosJson,AdvertenciasJson)
 VALUES(@IdDocumento,@VersionLector,@Metodo,@Estado,@DatosExtraidosJson,@AdvertenciasJson);
 SET @IdImportacionDocumento=CONVERT(bigint,SCOPE_IDENTITY());
END;

GO
