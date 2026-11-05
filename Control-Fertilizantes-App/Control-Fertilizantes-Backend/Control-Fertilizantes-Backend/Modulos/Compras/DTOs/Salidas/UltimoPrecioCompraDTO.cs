namespace Control_Fertilizantes_Backend.Modulos.Compras.DTOs.Salidas
{
    public class UltimoPrecioCompraDTO
    {
        public int IdCompra { get; set; }
        public DateTime FechaCompra { get; set; }
        public decimal PrecioTotal { get; set; }
        public decimal PrecioUnitarioCalculado { get; set; }
        public string? Moneda { get; set; }
        public string? NombreProveedor { get; set; }
    }
}
