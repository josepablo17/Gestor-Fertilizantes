using System.ComponentModel.DataAnnotations;

namespace Control_Fertilizantes_Backend.DTOs
{
    public class ProveedorActualizarDTO
    {

        [Required(ErrorMessage = "El id del proveedor es obligatorio.")]
        [Range(1, int.MaxValue, ErrorMessage = "El id del proveedor debe ser mayor que cero.")]
        public int IdProveedor { get; set; }

        [Required(ErrorMessage = "El nombre del proveedor es obligatorio.")]
        [StringLength(150, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 150 caracteres.")]
        public string? Nombre { get; set; }

        [Required(ErrorMessage = "El contacto del proveedor es obligatorio.")]
        [StringLength(150, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 150 caracteres.")]
        public string? Contacto { get; set; }

        [Required(ErrorMessage = "El telefono del proveedor es obligatorio.")]
        [StringLength(50, MinimumLength = 8, ErrorMessage = "El telefono debe tener entre 8 y 50 caracteres.")]
        public string? Telefono { get; set; }


        [Required(ErrorMessage = "El correo del proveedor es obligatorio.")]
        [StringLength(150, MinimumLength = 3, ErrorMessage = "El correo debe tener entre 3 y 150 caracteres.")]
        public string? Correo { get; set; }

        public bool EsProveedorAutorizado { get; set; }
    }
}
