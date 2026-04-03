using System.ComponentModel.DataAnnotations;

namespace Control_Fertilizantes_Backend.DTOs
{
    public class CompraCrearDTO
    {
        [Range(1, int.MaxValue, ErrorMessage = "El id del producto debe ser válido.")]
        public int IdProducto { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "El id del proveedor debe ser válido.")]
        public int IdProveedor { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "El id de la presentación del producto debe ser válido.")]
        public int IdPresentacionProducto { get; set; }

        [Required(ErrorMessage = "La fecha de compra es obligatoria.")]
        public DateTime FechaCompra { get; set; }

        [Range(0.0001, double.MaxValue, ErrorMessage = "La cantidad comprada debe ser mayor a cero.")]
        public decimal CantidadComprada { get; set; }

        [Range(0.0001, double.MaxValue, ErrorMessage = "El precio total debe ser mayor a cero.")]
        public decimal PrecioTotal { get; set; }

        [Required(ErrorMessage = "La moneda es obligatoria.")]
        [StringLength(10, ErrorMessage = "La moneda no puede superar los 10 caracteres.")]
        public string Moneda { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Las observaciones no pueden superar los 500 caracteres.")]
        public string? Observaciones { get; set; }
    }
}