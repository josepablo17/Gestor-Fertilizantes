
CREATE   PROCEDURE dbo.SP_Producto_Actualizar
 @IdProducto int,@Nombre nvarchar(150),@IdProductoBase int,@IdMarca int=NULL,@Categoria nvarchar(100)=NULL,@Descripcion nvarchar(250)=NULL,@CodigoInterno nvarchar(40)=NULL
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCatalogo;
 BEGIN TRY
IF NULLIF(LTRIM(RTRIM(@Nombre)),N'') IS NULL THROW 52000,N'Nombre es obligatorio.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.ProductosBase WHERE IdProductoBase=@IdProductoBase AND Activo=1) THROW 52000,N'Producto base inexistente o inactivo.',1;
 IF @IdMarca IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.Marcas WHERE IdMarca=@IdMarca AND Activo=1) THROW 52000,N'Marca inexistente o inactiva.',1;
 SET @Categoria=NULLIF(LTRIM(RTRIM(@Categoria)),N''); SET @Descripcion=NULLIF(LTRIM(RTRIM(@Descripcion)),N''); SET @CodigoInterno=NULLIF(LTRIM(RTRIM(@CodigoInterno)),N'');
 IF NOT EXISTS(SELECT 1 FROM dbo.Productos WITH(UPDLOCK,HOLDLOCK) WHERE IdProducto=@IdProducto) THROW 52004,N'Producto no existe.',1;
 UPDATE dbo.Productos SET Nombre=LTRIM(RTRIM(@Nombre)),IdProductoBase=@IdProductoBase,IdMarca=@IdMarca,Categoria=@Categoria,Descripcion=@Descripcion,
 CodigoInterno=COALESCE(@CodigoInterno,CodigoInterno),FechaModificacion=SYSUTCDATETIME() WHERE IdProducto=@IdProducto;
 SELECT @IdProducto AS IdProducto;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;

GO
