namespace Control_Fertilizantes_Backend.DTOs

{
    public class VistaPreviaProformaPdfDTO
    {
        public string NumeroProforma { get; set; } = string.Empty;
        public DateTime? Fecha { get; set; }
        public string NombreNegocio { get; set; } = string.Empty;
        public string NombreProveedorPdf { get; set; } = string.Empty;
        public string RazonSocial { get; set; } = string.Empty;
        public string Cedula { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string Vendedor { get; set; } = string.Empty;
        public string TipoDocumento { get; set; } = string.Empty;
        public int DiasCredito { get; set; }
        public DateTime? FechaVencimiento { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Descuento { get; set; }
        public decimal Iva { get; set; }
        public decimal Total { get; set; }

        public List<ProformaPdfLineaDTO> Lineas { get; set; } = new();
    }
}
