
CREATE   PROCEDURE dbo.usp_ProductoBase_Insertar
 @Codigo nvarchar(40),@Nombre nvarchar(150),@FormulaDeclarada nvarchar(100)=NULL,@Descripcion nvarchar(500)=NULL,@ComparabilidadRevisada bit=0
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCatalogo;
 BEGIN TRY
IF NULLIF(LTRIM(RTRIM(@Nombre)),N'') IS NULL THROW 52000,N'Nombre es obligatorio.',1;
IF NULLIF(LTRIM(RTRIM(@Codigo)),N'') IS NULL THROW 52000,N'Codigo es obligatorio.',1;
IF @ComparabilidadRevisada IS NULL THROW 52000,N'Indique si la agrupacion fue revisada.',1;
INSERT dbo.ProductosBase(Codigo,Nombre,FormulaDeclarada,Descripcion,ComparabilidadRevisada) VALUES(LTRIM(RTRIM(@Codigo)),LTRIM(RTRIM(@Nombre)),NULLIF(LTRIM(RTRIM(@FormulaDeclarada)),N''),NULLIF(LTRIM(RTRIM(@Descripcion)),N''),@ComparabilidadRevisada);
SELECT CONVERT(int,SCOPE_IDENTITY()) AS IdProductoBase;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;

GO
