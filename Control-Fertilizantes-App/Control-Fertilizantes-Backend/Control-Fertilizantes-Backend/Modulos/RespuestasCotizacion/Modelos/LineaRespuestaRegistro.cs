namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Modelos;

public class LineaRespuestaRegistro
{
    public int IdProformaProveedorDetalle { get; set; }
    public string EstadoRevision { get; set; } = "";
    public long? IdSolicitudCotizacionDetalle { get; set; }
    public int? NumeroLineaDocumento { get; set; }
    public string? CodigoProveedor { get; set; }
    public string? DescripcionProveedor { get; set; }
    public int? IdProducto { get; set; }
    public int? IdPresentacionProducto { get; set; }
    public decimal? Cantidad { get; set; }
    public decimal? PrecioUnitario { get; set; }
    public decimal? DescuentoPorcentaje { get; set; }
    public decimal? TotalLinea { get; set; }
    public decimal? DescuentoMonto { get; set; }
    public decimal? ImpuestoMonto { get; set; }
    public string TipoOferta { get; set; } = "Solicitada";
    public string EstadoOferta { get; set; } = "SinCotizar";
    public string BaseTotalLinea { get; set; } = "SinDefinir";
    public string? MotivoAlternativa { get; set; }
    public string? ObservacionValidacion { get; set; }
    public string? NombreProductoOriginal { get; set; }
    public string? MarcaOriginal { get; set; }
    public string? PresentacionOriginal { get; set; }
    public decimal? ContenidoEmpaqueOriginal { get; set; }
    public int? IdUnidadMedidaOriginal { get; set; }
    public string? CodigoUnidadOriginal { get; set; }
    public string? TipoBaseOriginal { get; set; }
    public decimal? FactorConversionOriginal { get; set; }
    public decimal? ContenidoNormalizadoOriginal { get; set; }
}
