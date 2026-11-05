using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Control_Fertilizantes_Backend.Comun.Validacion;

namespace Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Entradas;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class UnidadMedidaCrearDTO : IValidatableObject
{
    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    [StringLength(20, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string Codigo { get; set; } = string.Empty;

    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    [StringLength(50, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    [StringLength(20, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string TipoBase { get; set; } = string.Empty;

    [DecimalSql(18, 6)]
    [JsonConverter(typeof(DecimalCatalogoJsonConverter))]
    public decimal FactorConversion { get; set; }

    public bool EsUnidadBase { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (!new[] { "PESO", "VOLUMEN", "UNIDAD" }.Contains(TipoBase.Trim().ToUpperInvariant()))
            yield return new ValidationResult("TipoBase debe ser PESO, VOLUMEN o UNIDAD.", [nameof(TipoBase)]);
        if (EsUnidadBase && FactorConversion != 1m)
            yield return new ValidationResult("Una unidad base debe tener factor 1.", [nameof(FactorConversion)]);
    }
}
