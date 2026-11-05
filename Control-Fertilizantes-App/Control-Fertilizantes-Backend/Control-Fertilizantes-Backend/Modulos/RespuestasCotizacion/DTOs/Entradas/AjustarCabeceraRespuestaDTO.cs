using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.DTOs.Entradas;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class AjustarCabeceraRespuestaDTO
{
    [Required(ErrorMessage = "El motivo es obligatorio."), StringLength(1000, ErrorMessage = "El motivo admite hasta 1000 caracteres.")]
    public string Motivo { get; init; } = "";
    [Required(ErrorMessage = "La cabecera es obligatoria.")] public CabeceraRespuestaEntradaDTO Cabecera { get; init; } = null!;
}
