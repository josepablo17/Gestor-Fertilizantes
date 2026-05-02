namespace Control_Fertilizantes_Backend.DTOs
{
    public class ConfirmarComprasAutomaticasDTO
    {
        public string NumeroProforma { get; set; } = string.Empty;
        public DateTime? Fecha { get; set; }
        public int IdProveedor { get; set; }
        public List<ProformaPdfLineaValidadaDTO> Lineas { get; set; } = new();

    }
}
