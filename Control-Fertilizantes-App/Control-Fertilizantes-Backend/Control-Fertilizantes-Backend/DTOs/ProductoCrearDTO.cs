using System.ComponentModel.DataAnnotations;

namespace Control_Fertilizantes_Backend.DTOs
{
    public class ProductoCrearDTO
    {
        [Required(ErrorMessage = "El nombre del producto es obligatorio.")]
        [StringLength(150, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 150 caracteres.")]
        public string? Nombre { get; set; }

        [Required(ErrorMessage = "La categoría es obligatoria.")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "La categoría debe tener entre 3 y 100 caracteres.")]
        public string? Categoria { get; set; }

        [Required(ErrorMessage = "La marca es obligatoria.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "La marca debe tener entre 2 y 100 caracteres.")]
        public string? Marca { get; set; }

        [StringLength(300, ErrorMessage = "La descripción no puede superar los 300 caracteres.")]
        public string? Descripcion { get; set; }
    }
}