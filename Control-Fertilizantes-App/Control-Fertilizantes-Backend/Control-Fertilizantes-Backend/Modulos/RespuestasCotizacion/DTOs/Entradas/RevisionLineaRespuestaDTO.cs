using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.DTOs.Entradas;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class RevisionLineaRespuestaDTO
{
    [StringLength(1000, ErrorMessage = "La observación admite hasta 1000 caracteres.")]
    public string? Motivo { get; init; }
}
