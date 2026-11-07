namespace Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.DTOs.Salidas;

public sealed record LineaComparadaDTO(
    long IdSolicitudCotizacionDetalle,
    int NumeroLinea,
    string ProductoSolicitado,
    string? MarcaSolicitada,
    string PresentacionSolicitada,
    string TipoBase,
    string UnidadBase,
    decimal CantidadEmpaquesSolicitada,
    decimal ContenidoTotalSolicitado,
    decimal? MenorPrecioPorUnidadBase,
    decimal? MenorPrecioConCoberturaYVigencia,
    IReadOnlyList<OfertaComparadaDTO> Ofertas,
    ReferenciaCompraDTO? UltimaCompra);

public sealed record ReferenciaCompraDTO(int IdCompra, DateOnly FechaCompra, string? NombreProveedor, decimal PrecioPorUnidadBase);
