
CREATE   PROCEDURE dbo.SP_CompraAutomatica_BuscarProducto @Descripcion nvarchar(500) AS
BEGIN
 SET NOCOUNT ON;
 DECLARE @C table(IdProducto int,CodigoInterno nvarchar(40),NombreProducto nvarchar(150),IdProductoBase int,IdMarca int,Marca nvarchar(150),FormulaDeclarada nvarchar(100),CoincidenciaExacta bit,CantidadCandidatos int);
 INSERT @C EXEC dbo.usp_Producto_BuscarCandidatos @Descripcion;
 IF (SELECT COUNT(*) FROM @C)>1 THROW 52009,N'Hay varios productos candidatos; requiere seleccion manual.',1;
 SELECT IdProducto,NombreProducto,IdProductoBase,IdMarca,Marca,CoincidenciaExacta,CantidadCandidatos FROM @C;
END;

GO
