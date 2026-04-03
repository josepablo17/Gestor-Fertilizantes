using System.ComponentModel.DataAnnotations;

namespace Control_Fertilizantes_Backend.DTOs
{
    public class PresentacionProductoCrearDTO
    {
        [Required(ErrorMessage = "El producto es obligatorio.")]
        [Range(1, int.MaxValue, ErrorMessage = "El Id del producto debe ser válido.")]
        public int IdProducto { get; set; }

        [Required(ErrorMessage = "La descripción es obligatoria.")]
        [StringLength(150, ErrorMessage = "La descripción no puede superar los 150 caracteres.")]
        public string Descripcion { get; set; } = string.Empty;

        [Required(ErrorMessage = "La cantidad es obligatoria.")]
        [Range(0.0001, double.MaxValue, ErrorMessage = "La cantidad debe ser mayor a cero.")]
        public decimal Cantidad { get; set; }

        [Required(ErrorMessage = "La unidad de medida es obligatoria.")]
        [Range(1, int.MaxValue, ErrorMessage = "El Id de la unidad de medida debe ser válido.")]
        public int IdUnidadMedida { get; set; }

        [Required(ErrorMessage = "La cantidad normalizada es obligatoria.")]
        [Range(0.000001, double.MaxValue, ErrorMessage = "La cantidad normalizada debe ser mayor a cero.")]
        public decimal CantidadNormalizada { get; set; }
    }
}