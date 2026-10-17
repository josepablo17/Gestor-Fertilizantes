
CREATE   PROCEDURE dbo.SP_UnidadMedida_Actualizar
 @IdUnidadMedida int,@Codigo nvarchar(20),@Nombre nvarchar(50),@TipoBase nvarchar(20),@FactorConversion decimal(18,6),@EsUnidadBase bit
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCatalogo;
 BEGIN TRY
IF NULLIF(LTRIM(RTRIM(@Codigo)),N'') IS NULL THROW 52000,N'Codigo es obligatorio.',1; IF NULLIF(LTRIM(RTRIM(@Nombre)),N'') IS NULL THROW 52000,N'Nombre es obligatorio.',1;
 SET @Codigo=UPPER(LTRIM(RTRIM(@Codigo))); SET @Nombre=LTRIM(RTRIM(@Nombre)); SET @TipoBase=UPPER(LTRIM(RTRIM(@TipoBase)));
 IF @TipoBase IS NULL OR @TipoBase NOT IN('PESO','VOLUMEN','UNIDAD') THROW 52000,N'Dimension de unidad invalida.',1;
 IF @FactorConversion IS NULL OR @FactorConversion<=0 OR @EsUnidadBase IS NULL THROW 52000,N'Factor o indicador de unidad base invalidos.',1;
 IF @EsUnidadBase=1 AND @FactorConversion<>1 THROW 52000,N'La unidad base debe tener factor 1.',1;
IF NOT EXISTS(SELECT 1 FROM dbo.UnidadesMedida WITH(UPDLOCK,HOLDLOCK) WHERE IdUnidadMedida=@IdUnidadMedida) THROW 52004,N'Unidad no existe.',1; UPDATE dbo.UnidadesMedida SET Codigo=@Codigo,Nombre=@Nombre,TipoBase=@TipoBase,FactorConversion=@FactorConversion,EsUnidadBase=@EsUnidadBase WHERE IdUnidadMedida=@IdUnidadMedida; SELECT @IdUnidadMedida AS IdUnidadMedida;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;

GO
