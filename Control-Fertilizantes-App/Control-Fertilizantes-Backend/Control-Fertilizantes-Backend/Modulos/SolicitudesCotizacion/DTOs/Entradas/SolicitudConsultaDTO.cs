using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.DTOs.Entradas;
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class SolicitudConsultaDTO
{
    [RegularExpression("^(Borrador|Emitida|Cerrada|Cancelada)$", ErrorMessage = "Estado de solicitud inválido.")]
    public string? Estado { get; set; }
    [StringLength(50, ErrorMessage = "La búsqueda admite hasta {1} caracteres.")] public string? Buscar { get; set; }
    [Range(1, int.MaxValue, ErrorMessage = "La página debe ser mayor que cero.")] public int Pagina { get; set; } = 1;
    [Range(1, 200, ErrorMessage = "El tamaño de página debe estar entre {1} y {2}.")] public int TamanoPagina { get; set; } = 50;
}
