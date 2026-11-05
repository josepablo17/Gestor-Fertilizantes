using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Control_Fertilizantes_Backend.Comun.Validacion;

namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.DTOs.Entradas;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class ConciliarRespuestaDTO
{
    [Required(ErrorMessage = "El motivo es obligatorio."), StringLength(1000, ErrorMessage = "El motivo admite hasta 1000 caracteres.")]
    public string Motivo { get; init; } = "";
    [Required(ErrorMessage = "Indique el estado de conciliación.")] public string EstadoConciliacion { get; init; } = "";
    [DecimalOferta(18, 4), JsonConverter(typeof(DecimalOfertaJsonConverter))]
    public decimal? Tolerancia { get; init; }
}
