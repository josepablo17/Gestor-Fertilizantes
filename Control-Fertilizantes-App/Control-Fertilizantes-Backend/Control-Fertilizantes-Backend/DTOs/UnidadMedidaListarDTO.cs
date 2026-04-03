namespace Control_Fertilizantes_Backend.DTOs
{
    public class UnidadMedidaListarDTO
    {
        public int IdUnidadMedida { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string? TipoBase { get; set; }
        public decimal FactorConversion { get; set; }
        public bool EsUnidadBase { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
    }
}
