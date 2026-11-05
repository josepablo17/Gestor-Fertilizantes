namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Modelos;

public class LineaGuardarRespuesta
{
    public long? IdSolicitudDetalle { get; set; }
    public int? NumeroLinea { get; set; }
    public string? Codigo { get; set; }
    public string? Descripcion { get; set; }
    public int? IdProducto { get; set; }
    public int? IdPresentacionProducto { get; set; }
    public decimal? CantidadEmpaques { get; set; }
    public decimal? PrecioUnitario { get; set; }
    public decimal? DescuentoPorcentaje { get; set; }
    public decimal? TotalLinea { get; set; }
    public decimal? DescuentoMonto { get; set; }
    public decimal? ImpuestoMonto { get; set; }
    public string TipoOferta { get; set; } = "Solicitada";
    public string EstadoOferta { get; set; } = "SinCotizar";
    public string BaseTotalLinea { get; set; } = "SinDefinir";
    public string? MotivoAlternativa { get; set; }
    public string? Observacion { get; set; }
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
