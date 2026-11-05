using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.DTOs.Entradas;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class ProductoBaseCrearDTO
{
    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    [StringLength(40, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string Codigo { get; set; } = string.Empty;

    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    [StringLength(150, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string? FormulaDeclarada { get; set; }

    [StringLength(500, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string? Descripcion { get; set; }

    public bool ComparabilidadRevisada { get; set; }
}
