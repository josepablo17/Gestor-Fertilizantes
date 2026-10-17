
CREATE   PROCEDURE dbo.usp_Documento_Registrar
 @NombreOriginal nvarchar(255),@RutaAlmacenamiento nvarchar(800),@Sha256 varbinary(max),@TamanoBytes bigint,
 @Origen varchar(20),@VersionPlantilla nvarchar(40)=NULL,@IdDocumento bigint OUTPUT
AS
BEGIN
 SET NOCOUNT ON;
 IF @Sha256 IS NULL OR DATALENGTH(@Sha256)<>32 THROW 52000,N'SHA-256 debe contener exactamente 32 bytes.',1;
 IF NULLIF(LTRIM(RTRIM(@NombreOriginal)),N'') IS NULL OR NULLIF(LTRIM(RTRIM(@RutaAlmacenamiento)),N'') IS NULL
  THROW 52000,N'Nombre y ruta del archivo son obligatorios.',1;
 IF @TamanoBytes IS NULL OR @TamanoBytes<=0 OR @Origen IS NULL OR @Origen NOT IN('Generado','Recibido')
  THROW 52000,N'Tamano u origen de documento invalido.',1;
 INSERT dbo.Documentos(NombreOriginal,RutaAlmacenamiento,Sha256,TamanoBytes,Origen,VersionPlantilla)
 VALUES(LTRIM(RTRIM(@NombreOriginal)),LTRIM(RTRIM(@RutaAlmacenamiento)),CONVERT(binary(32),@Sha256),@TamanoBytes,@Origen,NULLIF(LTRIM(RTRIM(@VersionPlantilla)),N''));
 SET @IdDocumento=CONVERT(bigint,SCOPE_IDENTITY());
END;

GO
