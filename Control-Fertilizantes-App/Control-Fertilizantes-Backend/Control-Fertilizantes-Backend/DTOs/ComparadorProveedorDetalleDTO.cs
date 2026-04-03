namespace Control_Fertilizantes_Backend.DTOs
{
    public class ComparadorProveedorDetalleDTO
    {
        public int IdCompra { get; set; }
        public int IdProducto { get; set; }
        public int IdPresentacionProducto { get; set; }
        public int IdProveedor { get; set; }

        public string NombreProveedor { get; set; } = string.Empty;

        public DateTime FechaCompra { get; set; }
        public decimal CantidadComprada { get; set; }
        public decimal PrecioTotal { get; set; }
        public decimal PrecioUnitario { get; set; }

        public string Moneda { get; set; } = string.Empty;
        public string? Observaciones { get; set; }
    }
}