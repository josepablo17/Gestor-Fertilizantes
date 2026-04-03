namespace Control_Fertilizantes_Backend.DTOs
{
    public class ComparadorProveedorDetalleRespuestaDTO
    {
        public int IdProveedor { get; set; }
        public string NombreProveedor { get; set; } = string.Empty;

        public decimal UltimoPrecioUnitario { get; set; }
        public decimal PromedioHistorico { get; set; }
        public int CantidadCompras { get; set; }
        public decimal VariacionPorcentual { get; set; }
        public string Tendencia { get; set; } = string.Empty;

        public IEnumerable<ComparadorProveedorDetalleDTO> Historial { get; set; } = new List<ComparadorProveedorDetalleDTO>();
    }
}