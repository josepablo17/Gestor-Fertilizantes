namespace Control_Fertilizantes_Backend.DTOs
{
    public class GuardarProformaProveedorDTO
    {
        public string NumeroProforma { get; set; } = string.Empty;
        public DateTime? FechaProforma { get; set; }
        public DateTime? FechaVencimiento { get; set; }
        public int? DiasCredito { get; set; }
        public string? TipoDocumento { get; set; }

        public int IdProveedor { get; set; }

        public string? NombreProveedorPdf { get; set; }
        public string? NombreNegocio { get; set; }
        public string? RazonSocial { get; set; }
        public string? Cedula { get; set; }
        public string? Telefono { get; set; }
        public string? Vendedor { get; set; }

        public decimal? Subtotal { get; set; }
        public decimal? Descuento { get; set; }
        public decimal? IVA { get; set; }
        public decimal? Total { get; set; }

        public string? Observaciones { get; set; }

        public List<GuardarProformaProveedorDetalleDTO> Lineas { get; set; } = new();
        public List<GuardarProformaProveedorDetalleDTO> Detalles { get; set; } = new();
    }
}
