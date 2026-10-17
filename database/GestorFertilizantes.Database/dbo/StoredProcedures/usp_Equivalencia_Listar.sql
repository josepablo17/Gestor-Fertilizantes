
CREATE   PROCEDURE dbo.usp_Equivalencia_Listar @IdProveedor int,@SoloActivos bit=1 AS
BEGIN
 SET NOCOUNT ON;
 SELECT e.*,p.Nombre AS NombreProducto,pp.Descripcion AS NombrePresentacion FROM dbo.CompraAutomaticaEquivalencias e
 JOIN dbo.Productos p ON p.IdProducto=e.IdProducto LEFT JOIN dbo.PresentacionesProducto pp ON pp.IdPresentacionProducto=e.IdPresentacionProducto
 WHERE e.IdProveedor=@IdProveedor AND (@SoloActivos=0 OR e.Activo=1) ORDER BY e.IdEquivalencia;
END;

GO
