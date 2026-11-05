namespace Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.Modelos;

public sealed class ComparacionFila
{
    public long IdSolicitudCotizacionDetalle { get; init; }
    public int NumeroLinea { get; init; }
    public string ProductoSolicitado { get; init; } = string.Empty;
    public string? MarcaSolicitada { get; init; }
    public string PresentacionSolicitada { get; init; } = string.Empty;
    public string TipoBaseSolicitado { get; init; } = string.Empty;
    public decimal CantidadEmpaquesSolicitada { get; init; }
    public decimal ContenidoTotalSolicitado { get; init; }
    public long IdSolicitudCotizacionProveedor { get; init; }
    public int IdProveedor { get; init; }
    public string NombreProveedorActual { get; init; } = string.Empty;
    public string EstadoDestinatario { get; init; } = string.Empty;
    public int? IdProformaProveedor { get; init; }
    public string? NumeroProforma { get; init; }
    public int? VersionRespuesta { get; init; }
    public DateTime? FechaProforma { get; init; }
    public DateTime? FechaVencimiento { get; init; }
    public string? Moneda { get; init; }
    public string? EstadoConciliacion { get; init; }
    public string? JustificacionConciliacion { get; init; }
    public decimal? DescuentoGlobalDocumento { get; init; }
    public decimal? IvaDocumento { get; init; }
    public decimal? OtrosCargosDocumento { get; init; }
    public decimal? TotalDocumento { get; init; }
    public string? CondicionesPago { get; init; }
    public string? CondicionesEntrega { get; init; }
    public int? IdProformaProveedorDetalle { get; init; }
    public string? TipoOferta { get; init; }
    public string? EstadoOferta { get; init; }
    public string? ProductoOfrecido { get; init; }
    public string? MarcaOfrecida { get; init; }
    public string? PresentacionOfrecida { get; init; }
    public decimal? CantidadEmpaquesOfrecida { get; init; }
    public decimal? ContenidoNormalizadoOriginal { get; init; }
    public string? TipoBaseOfrecido { get; init; }
    public decimal? PrecioUnitario { get; init; }
    public decimal? TotalLinea { get; init; }
    public string? BaseTotalLinea { get; init; }
    public string? MotivoAlternativa { get; init; }
    public decimal? ContenidoTotalOfrecido { get; init; }
    public string CondicionComparacion { get; init; } = string.Empty;
    public bool EsComparable { get; init; }
    public decimal? PrecioPorUnidadBase { get; init; }
    public bool CubreCantidadSolicitada { get; init; }
    public bool? Vigente { get; init; }
    public decimal? MenorPrecioPorUnidadBase { get; init; }
    public decimal? MenorPrecioConCoberturaYVigencia { get; init; }
    public bool EsMenorPrecioUnitario { get; init; }
    public bool EsMenorPrecioConCoberturaYVigencia { get; init; }
}
