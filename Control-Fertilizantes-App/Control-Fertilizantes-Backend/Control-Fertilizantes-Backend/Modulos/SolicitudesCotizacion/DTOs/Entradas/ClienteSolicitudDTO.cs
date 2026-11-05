using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.DTOs.Entradas;
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class ClienteSolicitudDTO
{
    [Required(ErrorMessage = "El campo {0} es obligatorio."), StringLength(150, ErrorMessage = "{0} admite hasta {1} caracteres.")]
    public string Nombre { get; set; } = string.Empty;
    [StringLength(100, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? Identificacion { get; set; }
    [StringLength(500, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? Direccion { get; set; }
    [StringLength(50, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? Telefono { get; set; }
    [EmailAddress(ErrorMessage = "Indique un correo válido."), StringLength(150, ErrorMessage = "{0} admite hasta {1} caracteres.")]
    public string? Correo { get; set; }
}
