using System.ComponentModel.DataAnnotations;

namespace Control_Fertilizantes_Backend.DTOs
{
    public class UnidadMedidaCrearDTO
    {
        [Required(ErrorMessage = "El código de la unidad de medida es obligatorio.")]
        [StringLength(20, MinimumLength = 1, ErrorMessage = "El código debe tener entre 1 y 20 caracteres.")]
        public string? Codigo { get; set; }

        [Required(ErrorMessage = "El nombre de la unidad de medida es obligatorio.")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 50 caracteres.")]
        public string? Nombre { get; set; }

        [StringLength(20, ErrorMessage = "El tipo base no puede superar los 20 caracteres.")]
        public string? TipoBase { get; set; }

        [Required(ErrorMessage = "El factor de conversión es obligatorio.")]
        [Range(0.000001, double.MaxValue, ErrorMessage = "El factor de conversión debe ser mayor que cero.")]
        public decimal FactorConversion { get; set; }

        public bool EsUnidadBase { get; set; }

    }
}
