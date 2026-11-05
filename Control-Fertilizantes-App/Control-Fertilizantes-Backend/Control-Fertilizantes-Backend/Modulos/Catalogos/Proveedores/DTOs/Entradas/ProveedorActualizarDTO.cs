using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Control_Fertilizantes_Backend.Comun.Validacion;

namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.DTOs.Entradas;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class ProveedorActualizarDTO : IValidatableObject
{
    [Range(1, int.MaxValue, ErrorMessage = "El campo {0} debe ser mayor que cero.")]
    public int IdProveedor { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    [StringLength(150, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(150, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string? Contacto { get; set; }

    [StringLength(50, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string? Telefono { get; set; }

    [StringLength(150, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string? Correo { get; set; }

    [StringLength(250, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string? Direccion { get; set; }

    [StringLength(100, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string? Provincia { get; set; }

    [StringLength(100, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string? Canton { get; set; }

    [StringLength(100, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string? Distrito { get; set; }

    [StringLength(100, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string? FuenteExterna { get; set; }

    [StringLength(100, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string? IdExterno { get; set; }

    [StringLength(30, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string? TipoIdentificacion { get; set; }

    [StringLength(50, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string? IdentificacionFiscal { get; set; }

    [StringLength(2, ErrorMessage = "El campo {0} admite como máximo {1} caracteres.")]
    public string? PaisIdentificacion { get; set; }

    public bool EsProveedorAutorizado { get; set; }

    public DateTime? FechaUltimaSincronizacion { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var tipo = ValidacionCatalogo.Opcional(TipoIdentificacion);
        var fiscal = ValidacionCatalogo.Opcional(IdentificacionFiscal);
        var pais = ValidacionCatalogo.Opcional(PaisIdentificacion);
        if (new[] { tipo, fiscal, pais }.Any(x => x is not null) && new[] { tipo, fiscal, pais }.Any(x => x is null))
            yield return new ValidationResult("La identificación fiscal requiere tipo, número y país.", [nameof(IdentificacionFiscal)]);
        if (pais is not null && !System.Text.RegularExpressions.Regex.IsMatch(pais, "^[A-Z]{2}$"))
            yield return new ValidationResult("El país debe contener dos letras mayúsculas.", [nameof(PaisIdentificacion)]);
        var correo = ValidacionCatalogo.Opcional(Correo);
        if (correo is not null && (!new EmailAddressAttribute().IsValid(correo) || correo.Any(char.IsWhiteSpace) || !System.Text.RegularExpressions.Regex.IsMatch(correo, "^.+@.+\\..+$")))
            yield return new ValidationResult("El correo no tiene un formato válido.", [nameof(Correo)]);
        var telefono = ValidacionCatalogo.Opcional(Telefono);
        if (telefono is not null && !System.Text.RegularExpressions.Regex.IsMatch(telefono, "^[0-9+() -]+$"))
            yield return new ValidationResult("El teléfono contiene caracteres no válidos.", [nameof(Telefono)]);
    }
}
