-- El arnes ejecuta esto dentro de la transaccion de CADA caso y la revierte.
-- Solo se permite ejecutar la bateria en una base desechable GF_DB_TEST_<guid>.
DECLARE @MarcaA int,@MarcaB int,@BaseA int,@BaseB int,@ProductoA int,@ProductoB int,
 @KgPrueba int=(SELECT IdUnidadMedida FROM dbo.UnidadesMedida WHERE Codigo=N'KG');
IF @KgPrueba IS NULL THROW 51900,N'Falta la semilla tecnica de unidades.',1;
INSERT dbo.Marcas(Nombre)VALUES(N'Marca prueba A');SET @MarcaA=SCOPE_IDENTITY();
INSERT dbo.Marcas(Nombre)VALUES(N'Marca prueba B');SET @MarcaB=SCOPE_IDENTITY();
INSERT dbo.ProductosBase(Codigo,Nombre)VALUES(N'TEST-BASE-A',N'Base prueba A');SET @BaseA=SCOPE_IDENTITY();
INSERT dbo.ProductosBase(Codigo,Nombre)VALUES(N'TEST-BASE-B',N'Base prueba B');SET @BaseB=SCOPE_IDENTITY();
INSERT dbo.Productos(Nombre,IdProductoBase,IdMarca)VALUES(N'Producto prueba A',@BaseA,@MarcaA);SET @ProductoA=SCOPE_IDENTITY();
INSERT dbo.Productos(Nombre,IdProductoBase,IdMarca)VALUES(N'Producto prueba B',@BaseB,@MarcaB);SET @ProductoB=SCOPE_IDENTITY();
INSERT dbo.PresentacionesProducto(IdProducto,Descripcion,Cantidad,IdUnidadMedida,CantidadNormalizada)
VALUES(@ProductoA,N'Saco prueba 40 kg',40,@KgPrueba,40),(@ProductoB,N'Saco prueba 25 kg',25,@KgPrueba,25);
INSERT dbo.Proveedores(Nombre)VALUES(N'Proveedor de prueba A'),(N'Proveedor de prueba B');
