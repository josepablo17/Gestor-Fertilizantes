using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.DTOs.Entradas;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class ProductoActualizarDTO
{
    [Range(1, int.MaxValue, ErrorMessage = "El campo {0} debe ser mayor que cero.")]
    public int IdProducto { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    [StringLength(150, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string Nombre { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "El campo {0} debe ser mayor que cero.")]
    public int IdProductoBase { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "El campo {0} debe ser mayor que cero.")]
    public int? IdMarca { get; set; }

    [StringLength(100, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string? Categoria { get; set; }

    [StringLength(250, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string? Descripcion { get; set; }

    [StringLength(40, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string? CodigoInterno { get; set; }
}
