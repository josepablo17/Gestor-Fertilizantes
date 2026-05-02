namespace Control_Fertilizantes_Backend.DTOs
{
    public class ProformaProveedorDetalleRespuestaDTO
    {
        public int IdProformaProveedorDetalle { get; set; }

        public int IdProformaProveedor { get; set; }

        public string? CodigoProveedor { get; set; }
        public string DescripcionProveedor { get; set; } = string.Empty;

        public int? IdProducto { get; set; }
        public string? NombreProducto { get; set; }

        public int? IdPresentacionProducto { get; set; }
        public string? DescripcionPresentacion { get; set; }

        public decimal Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal DescuentoPorcentaje { get; set; }
        public decimal TotalLinea { get; set; }

        public bool ProductoEncontrado { get; set; }
        public bool PresentacionEncontrada { get; set; }
        public bool SePuedeRegistrar { get; set; }

        public string? ObservacionValidacion { get; set; }

        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
    }
}
