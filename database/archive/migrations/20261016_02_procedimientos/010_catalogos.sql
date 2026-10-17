/* Contratos v2: catalogos. Ejecutar junto con los otros scripts, atomicamente. */
SET NOCOUNT ON;
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
IF DB_NAME()<>N'BDComprasFertilizantes' THROW 52000,N'Base incorrecta.',1;
IF @@TRANCOUNT=0 THROW 52000,N'Aplicar los scripts en una transaccion.',1;
IF OBJECT_ID(N'dbo.SolicitudesCotizacion',N'U') IS NULL THROW 52000,N'Falta la migracion de tablas.',1;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Marca_Listar
 @SoloActivos bit=0,@Buscar nvarchar(150)=NULL
AS
BEGIN
 SET NOCOUNT ON;
SELECT IdMarca,Nombre,Activo,FechaCreacion,FechaModificacion FROM dbo.Marcas WHERE (@SoloActivos=0 OR Activo=1) AND (@Buscar IS NULL OR Nombre LIKE N'%'+@Buscar+N'%') ORDER BY Nombre,IdMarca;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Marca_ObtenerPorId
 @IdMarca int
AS
BEGIN
 SET NOCOUNT ON;
IF NOT EXISTS(SELECT 1 FROM dbo.Marcas WHERE IdMarca=@IdMarca) THROW 52004,N'Marca no existe.',1;
SELECT IdMarca,Nombre,Activo,FechaCreacion,FechaModificacion FROM dbo.Marcas WHERE IdMarca=@IdMarca;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Marca_Insertar
 @Nombre nvarchar(150)
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCatalogo;
 BEGIN TRY
IF NULLIF(LTRIM(RTRIM(@Nombre)),N'') IS NULL THROW 52000,N'Nombre es obligatorio.',1;
INSERT dbo.Marcas(Nombre) VALUES(LTRIM(RTRIM(@Nombre)));
SELECT CONVERT(int,SCOPE_IDENTITY()) AS IdMarca;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Marca_Actualizar
 @IdMarca int,@Nombre nvarchar(150)
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCatalogo;
 BEGIN TRY
IF NULLIF(LTRIM(RTRIM(@Nombre)),N'') IS NULL THROW 52000,N'Nombre es obligatorio.',1;
IF NOT EXISTS(SELECT 1 FROM dbo.Marcas WITH(UPDLOCK,HOLDLOCK) WHERE IdMarca=@IdMarca) THROW 52004,N'Marca no existe.',1;
UPDATE dbo.Marcas SET Nombre=LTRIM(RTRIM(@Nombre)),FechaModificacion=SYSUTCDATETIME() WHERE IdMarca=@IdMarca;
SELECT @IdMarca AS IdMarca;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_Marca_CambiarActivo
 @IdMarca int,@Activo bit
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCatalogo;
 BEGIN TRY
IF @Activo IS NULL THROW 52000,N'Activo es obligatorio.',1;
IF NOT EXISTS(SELECT 1 FROM dbo.Marcas WITH(UPDLOCK,HOLDLOCK) WHERE IdMarca=@IdMarca) THROW 52004,N'Marca no existe.',1;
UPDATE dbo.Marcas SET Activo=@Activo,FechaModificacion=SYSUTCDATETIME() WHERE IdMarca=@IdMarca; SELECT @IdMarca AS IdMarca;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_ProductoBase_Listar
 @SoloActivos bit=0,@Buscar nvarchar(150)=NULL
AS
BEGIN
 SET NOCOUNT ON;
SELECT IdProductoBase,Codigo,Nombre,FormulaDeclarada,Descripcion,ComparabilidadRevisada,Activo,FechaCreacion,FechaModificacion FROM dbo.ProductosBase WHERE (@SoloActivos=0 OR Activo=1) AND (@Buscar IS NULL OR Nombre LIKE N'%'+@Buscar+N'%') ORDER BY Nombre,IdProductoBase;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_ProductoBase_ObtenerPorId
 @IdProductoBase int
AS
BEGIN
 SET NOCOUNT ON;
IF NOT EXISTS(SELECT 1 FROM dbo.ProductosBase WHERE IdProductoBase=@IdProductoBase) THROW 52004,N'ProductoBase no existe.',1;
SELECT IdProductoBase,Codigo,Nombre,FormulaDeclarada,Descripcion,ComparabilidadRevisada,Activo,FechaCreacion,FechaModificacion FROM dbo.ProductosBase WHERE IdProductoBase=@IdProductoBase;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_ProductoBase_Insertar
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
CREATE OR ALTER PROCEDURE dbo.usp_ProductoBase_Actualizar
 @IdProductoBase int,@Codigo nvarchar(40),@Nombre nvarchar(150),@FormulaDeclarada nvarchar(100)=NULL,@Descripcion nvarchar(500)=NULL,@ComparabilidadRevisada bit=0
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
IF NOT EXISTS(SELECT 1 FROM dbo.ProductosBase WITH(UPDLOCK,HOLDLOCK) WHERE IdProductoBase=@IdProductoBase) THROW 52004,N'ProductoBase no existe.',1;
UPDATE dbo.ProductosBase SET Codigo=LTRIM(RTRIM(@Codigo)),Nombre=LTRIM(RTRIM(@Nombre)),FormulaDeclarada=NULLIF(LTRIM(RTRIM(@FormulaDeclarada)),N''),Descripcion=NULLIF(LTRIM(RTRIM(@Descripcion)),N''),ComparabilidadRevisada=@ComparabilidadRevisada,FechaModificacion=SYSUTCDATETIME() WHERE IdProductoBase=@IdProductoBase;
SELECT @IdProductoBase AS IdProductoBase;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.usp_ProductoBase_CambiarActivo
 @IdProductoBase int,@Activo bit
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCatalogo;
 BEGIN TRY
IF @Activo IS NULL THROW 52000,N'Activo es obligatorio.',1;
IF NOT EXISTS(SELECT 1 FROM dbo.ProductosBase WITH(UPDLOCK,HOLDLOCK) WHERE IdProductoBase=@IdProductoBase) THROW 52004,N'ProductoBase no existe.',1;
UPDATE dbo.ProductosBase SET Activo=@Activo,FechaModificacion=SYSUTCDATETIME() WHERE IdProductoBase=@IdProductoBase; SELECT @IdProductoBase AS IdProductoBase;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Producto_Listar
 @SoloActivos bit=0,@Buscar nvarchar(150)=NULL,@IdProductoBase int=NULL,@IdMarca int=NULL
AS
BEGIN
 SET NOCOUNT ON;
SELECT p.IdProducto,p.CodigoInterno,p.IdProductoBase,b.Codigo AS CodigoProductoBase,b.Nombre AS NombreProductoBase,
 b.FormulaDeclarada,b.ComparabilidadRevisada,p.IdMarca,m.Nombre AS Marca,p.Nombre,p.Categoria,p.Descripcion,p.Activo,p.FechaCreacion,p.FechaModificacion
 FROM dbo.Productos p JOIN dbo.ProductosBase b ON b.IdProductoBase=p.IdProductoBase LEFT JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca
 WHERE (@SoloActivos=0 OR p.Activo=1) AND (@Buscar IS NULL OR p.Nombre LIKE N'%'+@Buscar+N'%' OR p.CodigoInterno=@Buscar)
 AND (@IdProductoBase IS NULL OR p.IdProductoBase=@IdProductoBase) AND (@IdMarca IS NULL OR p.IdMarca=@IdMarca) ORDER BY p.Nombre,p.IdProducto;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Producto_ObtenerPorId
 @IdProducto int
AS
BEGIN
 SET NOCOUNT ON;
IF NOT EXISTS(SELECT 1 FROM dbo.Productos WHERE IdProducto=@IdProducto) THROW 52004,N'Producto no existe.',1;
SELECT p.IdProducto,p.CodigoInterno,p.IdProductoBase,b.Codigo AS CodigoProductoBase,b.Nombre AS NombreProductoBase,
 b.FormulaDeclarada,b.ComparabilidadRevisada,p.IdMarca,m.Nombre AS Marca,p.Nombre,p.Categoria,p.Descripcion,p.Activo,p.FechaCreacion,p.FechaModificacion
 FROM dbo.Productos p JOIN dbo.ProductosBase b ON b.IdProductoBase=p.IdProductoBase LEFT JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca WHERE p.IdProducto=@IdProducto;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Producto_Insertar
 @Nombre nvarchar(150),@IdProductoBase int,@IdMarca int=NULL,@Categoria nvarchar(100)=NULL,@Descripcion nvarchar(250)=NULL,@CodigoInterno nvarchar(40)=NULL
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
 IF @CodigoInterno IS NULL INSERT dbo.Productos(Nombre,IdProductoBase,IdMarca,Categoria,Descripcion) VALUES(LTRIM(RTRIM(@Nombre)),@IdProductoBase,@IdMarca,@Categoria,@Descripcion);
 ELSE INSERT dbo.Productos(CodigoInterno,Nombre,IdProductoBase,IdMarca,Categoria,Descripcion) VALUES(@CodigoInterno,LTRIM(RTRIM(@Nombre)),@IdProductoBase,@IdMarca,@Categoria,@Descripcion);
 SELECT CONVERT(int,SCOPE_IDENTITY()) AS IdProducto;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Producto_Actualizar
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
CREATE OR ALTER PROCEDURE dbo.SP_Producto_Desactivar
 @IdProducto int
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCatalogo;
 BEGIN TRY
IF NOT EXISTS(SELECT 1 FROM dbo.Productos WITH(UPDLOCK,HOLDLOCK) WHERE IdProducto=@IdProducto) THROW 52004,N'Producto no existe.',1; UPDATE dbo.Productos SET Activo=0,FechaModificacion=SYSUTCDATETIME() WHERE IdProducto=@IdProducto; SELECT 1 AS FilasAfectadas;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Productos_ListarParaDropdown

AS
BEGIN
 SET NOCOUNT ON;
SELECT p.IdProducto,p.CodigoInterno,p.IdProductoBase,b.Codigo AS CodigoProductoBase,b.Nombre AS NombreProductoBase,
 b.FormulaDeclarada,b.ComparabilidadRevisada,p.IdMarca,m.Nombre AS Marca,p.Nombre,p.Categoria,p.Descripcion,p.Activo,p.FechaCreacion,p.FechaModificacion
 FROM dbo.Productos p JOIN dbo.ProductosBase b ON b.IdProductoBase=p.IdProductoBase LEFT JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca WHERE p.Activo=1 AND b.Activo=1 AND (p.IdMarca IS NULL OR m.Activo=1) ORDER BY p.Nombre,p.IdProducto;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Proveedor_Listar
 @SoloActivos bit=0,@Buscar nvarchar(150)=NULL
AS
BEGIN
 SET NOCOUNT ON;
SELECT * FROM dbo.Proveedores WHERE (@SoloActivos=0 OR Activo=1) AND (@Buscar IS NULL OR Nombre LIKE N'%'+@Buscar+N'%') ORDER BY Nombre,IdProveedor;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Proveedor_ObtenerPorId
 @IdProveedor int
AS
BEGIN
 SET NOCOUNT ON;
IF NOT EXISTS(SELECT 1 FROM dbo.Proveedores WHERE IdProveedor=@IdProveedor) THROW 52004,N'Proveedor no existe.',1; SELECT * FROM dbo.Proveedores WHERE IdProveedor=@IdProveedor;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Proveedor_Insertar
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
CREATE OR ALTER PROCEDURE dbo.SP_Proveedor_Actualizar
 @IdProveedor int,@Nombre nvarchar(150),@Contacto nvarchar(150)=NULL,@Telefono nvarchar(50)=NULL,@Correo nvarchar(150)=NULL,@Direccion nvarchar(250)=NULL,@Provincia nvarchar(100)=NULL,@Canton nvarchar(100)=NULL,@Distrito nvarchar(100)=NULL,@FuenteExterna nvarchar(100)=NULL,@IdExterno nvarchar(100)=NULL,@TipoIdentificacion nvarchar(30)=NULL,@IdentificacionFiscal nvarchar(50)=NULL,@PaisIdentificacion char(2)=NULL,@EsProveedorAutorizado bit=0,@FechaUltimaSincronizacion datetime2(7)=NULL
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
IF NOT EXISTS(SELECT 1 FROM dbo.Proveedores WITH(UPDLOCK,HOLDLOCK) WHERE IdProveedor=@IdProveedor) THROW 52004,N'Proveedor no existe.',1;
 UPDATE dbo.Proveedores SET Nombre=@Nombre,Contacto=@Contacto,Telefono=@Telefono,Correo=@Correo,Direccion=@Direccion,Provincia=@Provincia,Canton=@Canton,Distrito=@Distrito,FuenteExterna=@FuenteExterna,IdExterno=@IdExterno,TipoIdentificacion=@TipoIdentificacion,IdentificacionFiscal=@IdentificacionFiscal,PaisIdentificacion=@PaisIdentificacion,EsProveedorAutorizado=@EsProveedorAutorizado,FechaUltimaSincronizacion=@FechaUltimaSincronizacion,FechaModificacion=SYSUTCDATETIME() WHERE IdProveedor=@IdProveedor; SELECT @IdProveedor AS IdProveedor;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_Proveedor_Desactivar
 @IdProveedor int
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCatalogo;
 BEGIN TRY
IF NOT EXISTS(SELECT 1 FROM dbo.Proveedores WITH(UPDLOCK,HOLDLOCK) WHERE IdProveedor=@IdProveedor) THROW 52004,N'Proveedor no existe.',1; UPDATE dbo.Proveedores SET Activo=0,FechaModificacion=SYSUTCDATETIME() WHERE IdProveedor=@IdProveedor; SELECT 1 AS FilasAfectadas;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_UnidadMedida_Insertar
 @Codigo nvarchar(20),@Nombre nvarchar(50),@TipoBase nvarchar(20),@FactorConversion decimal(18,6),@EsUnidadBase bit
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
INSERT dbo.UnidadesMedida(Codigo,Nombre,TipoBase,FactorConversion,EsUnidadBase)VALUES(@Codigo,@Nombre,@TipoBase,@FactorConversion,@EsUnidadBase); SELECT CONVERT(int,SCOPE_IDENTITY()) AS IdUnidadMedida;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_UnidadMedida_Actualizar
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
CREATE OR ALTER PROCEDURE dbo.SP_UnidadMedida_Desactivar
 @IdUnidadMedida int
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCatalogo;
 BEGIN TRY
IF NOT EXISTS(SELECT 1 FROM dbo.UnidadesMedida WITH(UPDLOCK,HOLDLOCK) WHERE IdUnidadMedida=@IdUnidadMedida) THROW 52004,N'Unidad no existe.',1;
 IF EXISTS(SELECT 1 FROM dbo.UnidadesMedida WHERE IdUnidadMedida=@IdUnidadMedida AND EsUnidadBase=1) THROW 52010,N'No se desactiva una unidad base.',1;
 IF EXISTS(SELECT 1 FROM dbo.PresentacionesProducto WHERE IdUnidadMedida=@IdUnidadMedida AND Activo=1) THROW 52010,N'Hay presentaciones activas que utilizan la unidad.',1;
 UPDATE dbo.UnidadesMedida SET Activo=0 WHERE IdUnidadMedida=@IdUnidadMedida; SELECT 1 AS FilasAfectadas;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_UnidadMedida_Listar
 @SoloActivos bit=0
AS
BEGIN
 SET NOCOUNT ON;
SELECT * FROM dbo.UnidadesMedida WHERE @SoloActivos=0 OR Activo=1 ORDER BY TipoBase,Codigo;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_UnidadMedida_ObtenerPorId
 @IdUnidadMedida int
AS
BEGIN
 SET NOCOUNT ON;
IF NOT EXISTS(SELECT 1 FROM dbo.UnidadesMedida WHERE IdUnidadMedida=@IdUnidadMedida) THROW 52004,N'Unidad no existe.',1; SELECT * FROM dbo.UnidadesMedida WHERE IdUnidadMedida=@IdUnidadMedida;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_UnidadesMedida_ListarParaDropdown

AS
BEGIN
 SET NOCOUNT ON;
SELECT IdUnidadMedida,Codigo,Nombre,TipoBase,FactorConversion,EsUnidadBase FROM dbo.UnidadesMedida WHERE Activo=1 ORDER BY TipoBase,Codigo;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_PresentacionesProducto_Insertar
 @IdProducto int,@Descripcion nvarchar(150),@Cantidad decimal(18,4),@IdUnidadMedida int,@CantidadNormalizada decimal(18,6)=NULL
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
INSERT dbo.PresentacionesProducto(IdProducto,Descripcion,Cantidad,IdUnidadMedida,CantidadNormalizada)VALUES(@IdProducto,LTRIM(RTRIM(@Descripcion)),@Cantidad,@IdUnidadMedida,@Calculada); SELECT CONVERT(int,SCOPE_IDENTITY()) AS IdPresentacionProducto;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_PresentacionesProducto_Actualizar
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
CREATE OR ALTER PROCEDURE dbo.SP_PresentacionesProducto_Desactivar
 @IdPresentacionProducto int
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @TranInicial int=@@TRANCOUNT;
 IF @TranInicial=0 BEGIN TRANSACTION; ELSE SAVE TRANSACTION OperacionCatalogo;
 BEGIN TRY
IF NOT EXISTS(SELECT 1 FROM dbo.PresentacionesProducto WITH(UPDLOCK,HOLDLOCK) WHERE IdPresentacionProducto=@IdPresentacionProducto) THROW 52004,N'Presentacion no existe.',1; UPDATE dbo.PresentacionesProducto SET Activo=0,FechaModificacion=SYSUTCDATETIME() WHERE IdPresentacionProducto=@IdPresentacionProducto; SELECT 1 AS FilasAfectadas;
  IF @TranInicial=0 COMMIT;
 END TRY BEGIN CATCH
  IF XACT_STATE()<>0 AND @TranInicial=0 ROLLBACK;
  ELSE IF XACT_STATE()=1 ROLLBACK TRANSACTION OperacionCatalogo;
  THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_PresentacionesProducto_Listar
 @IdProducto int=NULL,@SoloActivos bit=0
AS
BEGIN
 SET NOCOUNT ON;
SELECT pp.*,p.Nombre AS NombreProducto,p.IdProductoBase,p.IdMarca,m.Nombre AS Marca,u.Codigo AS CodigoUnidadMedida,u.Nombre AS NombreUnidadMedida,u.TipoBase,u.FactorConversion
 FROM dbo.PresentacionesProducto pp JOIN dbo.Productos p ON p.IdProducto=pp.IdProducto LEFT JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=pp.IdUnidadMedida WHERE (@IdProducto IS NULL OR pp.IdProducto=@IdProducto) AND (@SoloActivos=0 OR (pp.Activo=1 AND p.Activo=1 AND u.Activo=1)) ORDER BY p.Nombre,pp.CantidadNormalizada,pp.IdPresentacionProducto;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_PresentacionesProducto_ObtenerPorId
 @IdPresentacionProducto int
AS
BEGIN
 SET NOCOUNT ON;
IF NOT EXISTS(SELECT 1 FROM dbo.PresentacionesProducto WHERE IdPresentacionProducto=@IdPresentacionProducto) THROW 52004,N'Presentacion no existe.',1;
SELECT pp.*,p.Nombre AS NombreProducto,p.IdProductoBase,p.IdMarca,m.Nombre AS Marca,u.Codigo AS CodigoUnidadMedida,u.Nombre AS NombreUnidadMedida,u.TipoBase,u.FactorConversion
 FROM dbo.PresentacionesProducto pp JOIN dbo.Productos p ON p.IdProducto=pp.IdProducto LEFT JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=pp.IdUnidadMedida WHERE pp.IdPresentacionProducto=@IdPresentacionProducto;
END;
GO
