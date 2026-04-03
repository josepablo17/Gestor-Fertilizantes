namespace Control_Fertilizantes_Backend.DTOs
{
    public class CompraEvaluacionAutomaticaDTO
    {
        public int IdCompra { get; set; }

        public int IdProducto { get; set; }
        public string NombreProducto { get; set; } = string.Empty;

        public int IdPresentacionProducto { get; set; }
        public string NombrePresentacion { get; set; } = string.Empty;

        public int IdProveedor { get; set; }
        public string NombreProveedor { get; set; } = string.Empty;

        public DateTime FechaCompra { get; set; }

        public decimal PrecioUnitarioActual { get; set; }
        public decimal? PrecioUnitarioAnterior { get; set; }
        public decimal PrecioPromedioHistorico { get; set; }

        public decimal DiferenciaVsPromedio { get; set; }
        public decimal PorcentajeVsPromedio { get; set; }

        public decimal? DiferenciaVsUltimo { get; set; }
        public decimal? PorcentajeVsUltimo { get; set; }

        public string TendenciaPrecio { get; set; } = string.Empty;

        public string ClasificacionCompra { get; set; } = string.Empty;
        public string MensajeEvaluacion { get; set; } = string.Empty;
    }
}