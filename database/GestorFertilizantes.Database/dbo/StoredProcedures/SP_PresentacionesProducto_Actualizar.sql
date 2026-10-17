
CREATE   PROCEDURE dbo.SP_PresentacionesProducto_Actualizar
 @IdPresentacionProducto int,@IdProducto int,@Descripcion nvarchar(150),@Cantidad decimal(18,4),@IdUnidadMedida int,@CantidadNormalizada decimal(18,6)=NULL
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCatalogo;
 BEGIN TRY
IF NULLIF(LTRIM(RTRIM(@Descripcion)),N'') IS NULL THROW 52000,N'Descripcion es obligatorio.',1;
 IF @Cantidad IS NULL OR @Cantidad<=0 THROW 52000,N'Contenido por empaque debe ser positivo.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Productos WHERE IdProducto=@IdProducto AND Activo=1) THROW 52000,N'Producto inexistente o inactivo.',1;
 DECLARE @Factor decimal(18,6)=(SELECT FactorConversion FROM dbo.UnidadesMedida WHERE IdUnidadMedida=@IdUnidadMedida AND Activo=1);
 IF @Factor IS NULL THROW 52000,N'Unidad inexistente o inactiva.',1;
 DECLARE @Calculada decimal(18,6)=TRY_CONVERT(decimal(18,6),@Cantidad*@Factor);
 IF @Calculada IS NULL OR @Calculada<=0 THROW 52000,N'Contenido normalizado fuera de rango.',1;
 IF @CantidadNormalizada IS NOT NULL AND @CantidadNormalizada<>@Calculada THROW 52000,N'Cantidad normalizada incoherente con el factor.',1;
IF NOT EXISTS(SELECT 1 FROM dbo.PresentacionesProducto WITH(UPDLOCK,HOLDLOCK) WHERE IdPresentacionProducto=@IdPresentacionProducto) THROW 52004,N'Presentacion no existe.',1; UPDATE dbo.PresentacionesProducto SET IdProducto=@IdProducto,Descripcion=LTRIM(RTRIM(@Descripcion)),Cantidad=@Cantidad,IdUnidadMedida=@IdUnidadMedida,CantidadNormalizada=@Calculada,FechaModificacion=SYSUTCDATETIME() WHERE IdPresentacionProducto=@IdPresentacionProducto; SELECT @IdPresentacionProducto AS IdPresentacionProducto;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;

GO
