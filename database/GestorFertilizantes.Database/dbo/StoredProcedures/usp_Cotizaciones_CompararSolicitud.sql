
CREATE   PROCEDURE dbo.usp_Cotizaciones_CompararSolicitud
 @IdSolicitudCotizacion bigint,@Moneda varchar(10),@BaseTotalLinea varchar(30),@FechaReferencia date,
 @IncluirAlternativas bit=1,@IdSolicitudCotizacionDetalle bigint=NULL,@TipoBase nvarchar(20)=NULL
AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacion WHERE IdSolicitudCotizacion=@IdSolicitudCotizacion) THROW 52004,N'Solicitud no existe.',1;
 IF @Moneda IS NULL OR LEN(@Moneda)<>3 OR @Moneda COLLATE Latin1_General_100_BIN2 LIKE '%[^A-Z]%'
 OR @BaseTotalLinea IS NULL OR @BaseTotalLinea NOT IN('Bruto','NetoSinImpuestos','ConImpuestos') OR @FechaReferencia IS NULL
 OR @IncluirAlternativas IS NULL THROW 52000,N'Indique moneda, base de importe y fecha de referencia de comparacion.',1;
 IF @TipoBase IS NOT NULL AND @TipoBase NOT IN('PESO','VOLUMEN','UNIDAD') THROW 52000,N'Dimension invalida.',1;
 IF @IdSolicitudCotizacionDetalle IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.SolicitudesCotizacionDetalle
 WHERE IdSolicitudCotizacionDetalle=@IdSolicitudCotizacionDetalle AND IdSolicitudCotizacion=@IdSolicitudCotizacion)
 THROW 52000,N'La linea no pertenece a la solicitud.',1;
 ;WITH Ultimas AS(
  SELECT p.*,ROW_NUMBER() OVER(PARTITION BY IdSolicitudCotizacionProveedor ORDER BY VersionRespuesta DESC) AS rn
  FROM dbo.ProformasProveedor p WHERE p.IdSolicitudCotizacion=@IdSolicitudCotizacion AND p.Estado='Validada'
 ),Datos AS(
 SELECT s.IdSolicitudCotizacionDetalle,s.NumeroLinea,s.NombreProductoOriginal AS ProductoSolicitado,s.MarcaOriginal AS MarcaSolicitada,
 s.PresentacionOriginal AS PresentacionSolicitada,s.TipoBaseOriginal AS TipoBaseSolicitado,s.CantidadEmpaquesSolicitada,
 CONVERT(decimal(28,6),s.CantidadEmpaquesSolicitada*s.ContenidoNormalizadoOriginal) AS ContenidoTotalSolicitado,
 sp.IdSolicitudCotizacionProveedor,sp.IdProveedor,pr.Nombre AS NombreProveedorActual,sp.Estado AS EstadoDestinatario,
 p.IdProformaProveedor,p.NumeroProforma,p.VersionRespuesta,p.FechaProforma,p.FechaVencimiento,p.Moneda,
 p.EstadoConciliacion,p.JustificacionConciliacion,p.Descuento AS DescuentoGlobalDocumento,p.IVA AS IVADocumento,
 p.OtrosCargos AS OtrosCargosDocumento,p.Total AS TotalDocumento,p.CondicionesPago,p.CondicionesEntrega,p.DatosProveedorOriginalJson,
 d.IdProformaProveedorDetalle,d.TipoOferta,d.EstadoOferta,d.NombreProductoOriginal AS ProductoOfrecido,d.MarcaOriginal AS MarcaOfrecida,
 d.PresentacionOriginal AS PresentacionOfrecida,d.Cantidad AS CantidadEmpaquesOfrecida,d.ContenidoNormalizadoOriginal,
 d.TipoBaseOriginal AS TipoBaseOfrecido,d.PrecioUnitario,d.TotalLinea,d.BaseTotalLinea,d.MotivoAlternativa,
 CONVERT(decimal(28,6),d.Cantidad*d.ContenidoNormalizadoOriginal) AS ContenidoTotalOfrecido,
 CASE WHEN p.IdProformaProveedor IS NULL THEN 'SinRespuestaValidada'
 WHEN d.IdProformaProveedorDetalle IS NULL THEN 'LineaSinCotizar'
 WHEN d.EstadoOferta<>'Cotizada' THEN d.EstadoOferta
 WHEN p.Moneda<>@Moneda THEN 'MonedaDistinta'
 WHEN d.BaseTotalLinea<>@BaseTotalLinea THEN 'BasePrecioDistinta'
 WHEN d.TipoBaseOriginal<>s.TipoBaseOriginal THEN 'DimensionDistinta'
 WHEN d.TipoOferta='Alternativa' AND @IncluirAlternativas=0 THEN 'AlternativaNoIncluida'
 WHEN d.IdProducto<>s.IdProducto AND NOT(po.IdProductoBase=ps.IdProductoBase AND b.ComparabilidadRevisada=1) THEN 'EquivalenciaNoRevisada'
 ELSE 'Comparable' END AS CondicionComparacion
 FROM dbo.SolicitudesCotizacionDetalle s JOIN dbo.SolicitudesCotizacionProveedor sp ON sp.IdSolicitudCotizacion=s.IdSolicitudCotizacion
 JOIN dbo.Proveedores pr ON pr.IdProveedor=sp.IdProveedor JOIN dbo.Productos ps ON ps.IdProducto=s.IdProducto
 LEFT JOIN Ultimas p ON p.IdSolicitudCotizacionProveedor=sp.IdSolicitudCotizacionProveedor AND p.rn=1
 LEFT JOIN dbo.ProformasProveedorDetalle d ON d.IdProformaProveedor=p.IdProformaProveedor AND d.IdSolicitudCotizacionDetalle=s.IdSolicitudCotizacionDetalle
 LEFT JOIN dbo.Productos po ON po.IdProducto=d.IdProducto LEFT JOIN dbo.ProductosBase b ON b.IdProductoBase=po.IdProductoBase
 WHERE s.IdSolicitudCotizacion=@IdSolicitudCotizacion AND (@IdSolicitudCotizacionDetalle IS NULL OR s.IdSolicitudCotizacionDetalle=@IdSolicitudCotizacionDetalle)
 AND (@TipoBase IS NULL OR s.TipoBaseOriginal=@TipoBase)
 ),Precios AS(
 SELECT *,CONVERT(bit,CASE WHEN CondicionComparacion='Comparable' THEN 1 ELSE 0 END) AS EsComparable,
 CASE WHEN CondicionComparacion='Comparable' THEN TRY_CONVERT(decimal(28,8),TotalLinea/NULLIF(ContenidoTotalOfrecido,0)) END AS PrecioPorUnidadBase,
 CONVERT(bit,CASE WHEN ContenidoTotalOfrecido>=ContenidoTotalSolicitado THEN 1 ELSE 0 END) AS CubreCantidadSolicitada,
 CONVERT(bit,CASE WHEN FechaVencimiento IS NULL THEN NULL WHEN FechaVencimiento>=@FechaReferencia THEN 1 ELSE 0 END) AS Vigente
 FROM Datos
 ),Minimos AS(
 SELECT *,MIN(PrecioPorUnidadBase) OVER(PARTITION BY IdSolicitudCotizacionDetalle) AS MenorPrecioPorUnidadBase,
 MIN(CASE WHEN CubreCantidadSolicitada=1 AND Vigente=1 THEN PrecioPorUnidadBase END) OVER(PARTITION BY IdSolicitudCotizacionDetalle) AS MenorPrecioConCoberturaYVigencia
 FROM Precios
 )
 SELECT *,CONVERT(bit,CASE WHEN EsComparable=1 AND PrecioPorUnidadBase=MenorPrecioPorUnidadBase THEN 1 ELSE 0 END) AS EsMenorPrecioUnitario,
 CONVERT(bit,CASE WHEN EsComparable=1 AND CubreCantidadSolicitada=1 AND Vigente=1 AND PrecioPorUnidadBase=MenorPrecioConCoberturaYVigencia THEN 1 ELSE 0 END) AS EsMenorPrecioConCoberturaYVigencia
 FROM Minimos ORDER BY NumeroLinea,CASE WHEN PrecioPorUnidadBase IS NULL THEN 1 ELSE 0 END,PrecioPorUnidadBase,IdProveedor,IdProformaProveedorDetalle;
END;

GO
