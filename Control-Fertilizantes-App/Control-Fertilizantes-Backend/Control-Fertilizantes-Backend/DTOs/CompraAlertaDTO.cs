namespace Control_Fertilizantes_Backend.DTOs
{
    public class CompraAlertaDTO
    {
        public string TipoAlerta { get; set; } = string.Empty;
        public string Nivel { get; set; } = string.Empty;
        public string Mensaje { get; set; } = string.Empty;
        public decimal? ValorReferencia { get; set; }
    }
}