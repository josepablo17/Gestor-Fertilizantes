namespace Control_Fertilizantes_Backend.DTOs
{
    public class CompraListarDTO
    {
        public int IdCompra { get; set; }
        public int IdProducto { get; set; }
        public string NombreProducto { get; set; } = string.Empty;
        public string Categoria { get; set; } = string.Empty;
        public string Marca { get; set; } = string.Empty;

        public int IdProveedor { get; set; }
        public string NombreProveedor { get; set; } = string.Empty;

        public int IdPresentacionProducto { get; set; }
        public string Presentacion { get; set; } = string.Empty;
        public decimal CantidadPresentacion { get; set; }
        public string UnidadMedida { get; set; } = string.Empty;

        public DateTime FechaCompra { get; set; }
        public decimal CantidadComprada { get; set; }
        public decimal PrecioTotal { get; set; }
        public string Moneda { get; set; } = string.Empty;
        public decimal PrecioUnitarioCalculado { get; set; }

        public decimal? PrecioUnitarioAnterior { get; set; }
        public decimal? DiferenciaPrecio { get; set; }
        public decimal? PorcentajeCambioPrecio { get; set; }
        public string TendenciaPrecio { get; set; } = string.Empty;

        public string? Observaciones { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaModificacion { get; set; }
    }
}
