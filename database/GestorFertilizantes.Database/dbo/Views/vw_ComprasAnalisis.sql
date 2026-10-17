
/* Compras reales: modulo historico independiente de la recepcion de cotizaciones.
   Las lecturas recalculan antecedentes por moneda y orden fecha/id, sin confiar
   en columnas de tendencia guardadas por versiones antiguas. */
CREATE   VIEW dbo.vw_ComprasAnalisis AS
WITH Ordenadas AS(
 SELECT c.IdCompra,c.IdProducto,c.IdProveedor,c.IdPresentacionProducto,c.FechaCompra,c.CantidadComprada,c.PrecioTotal,c.Moneda,c.Observaciones,c.FechaCreacion,c.FechaModificacion,
 CONVERT(decimal(18,6),c.PrecioTotal/NULLIF(c.CantidadComprada,0)) AS PrecioUnitarioCalculado,
 LAG(c.IdCompra) OVER(PARTITION BY c.IdProducto,c.IdPresentacionProducto,c.Moneda ORDER BY c.FechaCompra,c.IdCompra) AS IdCompraAnterior,
 LAG(CONVERT(decimal(18,6),c.PrecioTotal/NULLIF(c.CantidadComprada,0))) OVER(PARTITION BY c.IdProducto,c.IdPresentacionProducto,c.Moneda ORDER BY c.FechaCompra,c.IdCompra) AS PrecioUnitarioAnterior
 FROM dbo.Compras c
)
SELECT o.*,p.Nombre AS NombreProducto,p.Categoria,p.Marca,pr.Nombre AS NombreProveedor,pr.EsProveedorAutorizado,
 pp.Descripcion AS NombrePresentacion,pp.Cantidad AS ContenidoEmpaque,pp.CantidadNormalizada,u.Codigo AS CodigoUnidad,u.Nombre AS NombreUnidadMedida,u.TipoBase,
 CONVERT(decimal(28,8),o.PrecioTotal/NULLIF(CONVERT(decimal(28,6),o.CantidadComprada*pp.CantidadNormalizada),0)) AS PrecioPorUnidadBase,
 CONVERT(decimal(18,6),o.PrecioUnitarioCalculado-o.PrecioUnitarioAnterior) AS DiferenciaPrecio,
 CONVERT(decimal(18,6),100.0*(o.PrecioUnitarioCalculado-o.PrecioUnitarioAnterior)/NULLIF(o.PrecioUnitarioAnterior,0)) AS PorcentajeCambioPrecio,
 CONVERT(nvarchar(30),CASE WHEN o.IdCompraAnterior IS NULL THEN 'PRIMER_REGISTRO' WHEN o.PrecioUnitarioAnterior=0 THEN 'NO_COMPARABLE'
 WHEN o.PrecioUnitarioCalculado>o.PrecioUnitarioAnterior THEN 'AUMENTO' WHEN o.PrecioUnitarioCalculado<o.PrecioUnitarioAnterior THEN 'DISMINUCION' ELSE 'SIN_CAMBIO' END) AS TendenciaPrecio
FROM Ordenadas o JOIN dbo.Productos p ON p.IdProducto=o.IdProducto JOIN dbo.Proveedores pr ON pr.IdProveedor=o.IdProveedor
JOIN dbo.PresentacionesProducto pp ON pp.IdPresentacionProducto=o.IdPresentacionProducto JOIN dbo.UnidadesMedida u ON u.IdUnidadMedida=pp.IdUnidadMedida;

GO
