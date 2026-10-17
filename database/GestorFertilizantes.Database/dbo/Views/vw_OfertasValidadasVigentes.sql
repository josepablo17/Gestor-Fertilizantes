
/* No convierte monedas, no reparte impuestos ni descuentos globales. El costo
   efectivo de comparacion se definira al acordar esas politicas. */
CREATE   VIEW dbo.vw_OfertasValidadasVigentes AS
WITH Vigentes AS(
 SELECT p.*,ROW_NUMBER() OVER(PARTITION BY p.IdSolicitudCotizacionProveedor ORDER BY p.VersionRespuesta DESC) AS Orden
 FROM dbo.ProformasProveedor p WHERE p.Estado='Validada'
)
SELECT p.IdProformaProveedor,p.IdSolicitudCotizacion,p.IdSolicitudCotizacionProveedor,p.IdProveedor,p.VersionRespuesta,
 p.Moneda,p.FechaProforma,p.FechaVencimiento,d.IdProformaProveedorDetalle,d.IdSolicitudCotizacionDetalle,d.TipoOferta,
 d.NombreProductoOriginal,d.MarcaOriginal,d.PresentacionOriginal,d.Cantidad AS CantidadEmpaques,
 d.ContenidoEmpaqueOriginal,d.CodigoUnidadOriginal,d.TipoBaseOriginal,d.ContenidoNormalizadoOriginal,
 d.PrecioUnitario AS PrecioPorEmpaqueDocumento,d.TotalLinea,d.BaseTotalLinea,
 CONVERT(decimal(28,6),CONVERT(decimal(28,6),d.Cantidad)*d.ContenidoNormalizadoOriginal) AS ContenidoTotalNormalizado,
 CONVERT(decimal(28,8),d.PrecioUnitario/NULLIF(d.ContenidoNormalizadoOriginal,0)) AS PrecioDocumentoPorUnidadBase
FROM Vigentes p JOIN dbo.ProformasProveedorDetalle d ON d.IdProformaProveedor=p.IdProformaProveedor
WHERE p.Orden=1 AND d.EstadoOferta='Cotizada' AND d.EstadoRevision='Revisada';

GO
