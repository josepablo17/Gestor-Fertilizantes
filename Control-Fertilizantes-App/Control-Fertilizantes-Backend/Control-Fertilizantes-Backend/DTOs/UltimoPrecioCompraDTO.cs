namespace Control_Fertilizantes_Backend.DTOs
{
    public class UltimoPrecioCompraDTO
    {
        public int IdCompra { get; set; }
        public DateTime FechaCompra { get; set; }
        public decimal PrecioTotal { get; set; }
        public decimal PrecioUnitarioCalculado { get; set; }
        public string Moneda { get; set; } = string.Empty;
        public string NombreProveedor { get; set; } = string.Empty;
    }
}
