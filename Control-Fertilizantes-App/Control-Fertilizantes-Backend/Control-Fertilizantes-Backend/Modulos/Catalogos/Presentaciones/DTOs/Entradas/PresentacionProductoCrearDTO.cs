using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Control_Fertilizantes_Backend.Comun.Validacion;

namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.DTOs.Entradas;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class PresentacionProductoCrearDTO
{
    [Range(1, int.MaxValue, ErrorMessage = "El campo {0} debe ser mayor que cero.")]
    public int IdProducto { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    [StringLength(150, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string Descripcion { get; set; } = string.Empty;

    [DecimalSql(18, 4)]
    public decimal Cantidad { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "El campo {0} debe ser mayor que cero.")]
    public int IdUnidadMedida { get; set; }
}
