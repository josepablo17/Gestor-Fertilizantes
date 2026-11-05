using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.DTOs.Entradas;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class MarcaCrearDTO
{
    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    [StringLength(150, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string Nombre { get; set; } = string.Empty;
}
