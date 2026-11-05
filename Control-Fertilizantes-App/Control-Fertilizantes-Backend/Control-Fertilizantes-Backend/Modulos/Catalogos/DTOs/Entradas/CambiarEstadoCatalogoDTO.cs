using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Control_Fertilizantes_Backend.Modulos.Catalogos.DTOs.Entradas;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class CambiarEstadoCatalogoDTO
{
    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    public bool? Activo { get; set; }
}
