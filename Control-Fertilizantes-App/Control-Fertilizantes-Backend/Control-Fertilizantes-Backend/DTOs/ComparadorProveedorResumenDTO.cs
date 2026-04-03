namespace Control_Fertilizantes_Backend.DTOs
{
    public class ComparadorProveedorResumenDTO
    {
        public int CantidadProveedoresAnalizados { get; set; }

        public int? IdProveedorMejorPrecio { get; set; }
        public string NombreProveedorMejorPrecio { get; set; } = string.Empty;
        public decimal MejorPrecio { get; set; }

        public int? IdProveedorMasEstable { get; set; }
        public string NombreProveedorMasEstable { get; set; } = string.Empty;
        public decimal VariacionProveedorMasEstable { get; set; }

        public int? IdProveedorRecomendado { get; set; }
        public string NombreProveedorRecomendado { get; set; } = string.Empty;
        public decimal PuntajeProveedorRecomendado { get; set; }

        public decimal DiferenciaEntreMejorYPeorPrecio { get; set; }
        public DateTime? FechaUltimaActualizacion { get; set; }

        public string MensajeResumen { get; set; } = string.Empty;
    }
}