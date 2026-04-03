namespace Control_Fertilizantes_Backend.DTOs
{
    public class CompraResumenInteligenteDTO
    {
        public int IdProducto { get; set; }
        public string NombreProducto { get; set; } = string.Empty;

        public int IdPresentacionProducto { get; set; }
        public string NombrePresentacion { get; set; } = string.Empty;
        public string NombreUnidadMedida { get; set; } = string.Empty;

        public int CantidadCompras { get; set; }

        public decimal PrecioPromedioHistorico { get; set; }
        public decimal PrecioMinimoHistorico { get; set; }
        public decimal PrecioMaximoHistorico { get; set; }

        public decimal? UltimoPrecioUnitario { get; set; }
        public decimal? PrecioAnteriorAlUltimo { get; set; }

        public DateTime? FechaUltimaCompra { get; set; }
        public DateTime? FechaPrimeraCompra { get; set; }

        public decimal DiferenciaVsPromedioHistorico { get; set; }
        public decimal PorcentajeVariacionVsPromedio { get; set; }
        public decimal PorcentajeVariacionVsUltimoPrecio { get; set; }

        public string TendenciaGeneral { get; set; } = string.Empty;
    }
}