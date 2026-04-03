namespace Control_Fertilizantes_Backend.DTOs
{
    public class ComparadorProveedorItemDTO
    {
        public int IdProveedor { get; set; }
        public string NombreProveedor { get; set; } = string.Empty;
        public bool EsProveedorAutorizado { get; set; }

        public DateTime? FechaUltimaCompra { get; set; }
        public decimal UltimoPrecioUnitario { get; set; }
        public decimal? PrecioUnitarioAnterior { get; set; }

        public int CantidadCompras { get; set; }
        public decimal PromedioHistorico { get; set; }
        public decimal PrecioMinimoHistorico { get; set; }
        public decimal PrecioMaximoHistorico { get; set; }

        public decimal VariacionPorcentual { get; set; }
        public decimal DiferenciaVsPromedioPorcentual { get; set; }
        public decimal DiferenciaVsPrecioAnteriorPorcentual { get; set; }

        public string Tendencia { get; set; } = string.Empty;

        // Calculados en el servicio
        public decimal PuntajeTotal { get; set; }
        public string Evaluacion { get; set; } = string.Empty;
        public string Recomendacion { get; set; } = string.Empty;

        // Banderas útiles para UI
        public bool EsMejorPrecio { get; set; }
        public bool EsMasEstable { get; set; }
        public bool EsProveedorRecomendado { get; set; }
        public bool TieneDatosSuficientes { get; set; }
    }
}