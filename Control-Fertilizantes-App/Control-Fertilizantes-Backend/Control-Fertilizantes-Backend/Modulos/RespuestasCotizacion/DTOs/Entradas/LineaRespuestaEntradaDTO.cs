using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Control_Fertilizantes_Backend.Comun.Validacion;

namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.DTOs.Entradas;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class LineaRespuestaEntradaDTO
{
    public long? IdSolicitudDetalle { get; init; }
    public int? NumeroLinea { get; init; }
    public int? IdPresentacionProducto { get; init; }
    [StringLength(100, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? Codigo { get; init; }
    [StringLength(500, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? Descripcion { get; init; }
    [Required(ErrorMessage = "Indique el tipo de oferta.")] public string TipoOferta { get; init; } = "";
    [Required(ErrorMessage = "Indique el estado de la oferta.")] public string EstadoOferta { get; init; } = "";
    [Required(ErrorMessage = "Indique la base del total.")] public string BaseTotalLinea { get; init; } = "SinDefinir";
    [DecimalOferta(18, 4, Positivo = true), JsonConverter(typeof(DecimalOfertaJsonConverter))]
    public decimal? CantidadEmpaques { get; init; }
    [DecimalOferta(18, 6), JsonConverter(typeof(DecimalOfertaJsonConverter))]
    public decimal? PrecioUnitario { get; init; }
    [DecimalOferta(5, 2), JsonConverter(typeof(DecimalOfertaJsonConverter))]
    public decimal? DescuentoPorcentaje { get; init; }
    [DecimalOferta(18, 4), JsonConverter(typeof(DecimalOfertaJsonConverter))]
    public decimal? TotalLinea { get; init; }
    [DecimalOferta(18, 4), JsonConverter(typeof(DecimalOfertaJsonConverter))]
    public decimal? DescuentoMonto { get; init; }
    [DecimalOferta(18, 4), JsonConverter(typeof(DecimalOfertaJsonConverter))]
    public decimal? ImpuestoMonto { get; init; }
    [StringLength(1000, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? MotivoAlternativa { get; init; }
    [StringLength(1000, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? Observacion { get; init; }
}
