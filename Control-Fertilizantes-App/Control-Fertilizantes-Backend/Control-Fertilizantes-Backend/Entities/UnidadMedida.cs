namespace Control_Fertilizantes_Backend.Entities
{
    public class UnidadMedida
    {
        public int IdUnidadMedida { get; set; }
        public string? Codigo { get; set; } 
        public string? Nombre { get; set; }
        public string? TipoBase { get; set; }
        public decimal FactorConversion { get; set; }
        public bool EsUnidadBase { get; set; }
        public bool Activo { get; set; }

    }
}
