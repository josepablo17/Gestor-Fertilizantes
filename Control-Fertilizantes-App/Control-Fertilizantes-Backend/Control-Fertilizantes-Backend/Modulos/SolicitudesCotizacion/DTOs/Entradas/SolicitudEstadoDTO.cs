using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.DTOs.Entradas;
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class SolicitudEstadoDTO
{
    [Required(ErrorMessage = "El campo {0} es obligatorio."), RegularExpression("^(Cerrada|Cancelada)$", ErrorMessage = "Indique Cerrada o Cancelada.")]
    public string Estado { get; set; } = string.Empty;
}
