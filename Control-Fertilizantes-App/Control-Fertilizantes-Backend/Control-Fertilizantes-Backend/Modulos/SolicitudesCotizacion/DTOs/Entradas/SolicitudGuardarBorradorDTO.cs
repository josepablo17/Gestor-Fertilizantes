using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.DTOs.Entradas;
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class SolicitudGuardarBorradorDTO
{
    [Required(ErrorMessage = "El campo {0} es obligatorio.")] public DateOnly? FechaSolicitud { get; set; }
    public DateOnly? FechaLimiteRespuesta { get; set; }
    public ClienteSolicitudDTO? DatosCliente { get; set; }
    [StringLength(2000, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? Observaciones { get; set; }
    [Required(ErrorMessage = "El campo {0} es obligatorio."), MaxLength(100, ErrorMessage = "Se admiten hasta {1} renglones.")]
    public List<SolicitudLineaGuardarDTO> Lineas { get; set; } = [];
    [Required(ErrorMessage = "El campo {0} es obligatorio."), MaxLength(50, ErrorMessage = "Se admiten hasta {1} proveedores.")]
    public List<int> Proveedores { get; set; } = [];
}
