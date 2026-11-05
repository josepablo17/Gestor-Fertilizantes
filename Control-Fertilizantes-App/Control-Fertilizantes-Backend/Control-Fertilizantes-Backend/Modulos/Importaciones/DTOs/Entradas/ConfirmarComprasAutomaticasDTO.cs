using Control_Fertilizantes_Backend.Modulos.Importaciones.DTOs.Compartidos;
namespace Control_Fertilizantes_Backend.Modulos.Importaciones.DTOs.Entradas
{
    public class ConfirmarComprasAutomaticasDTO
    {
        public string NumeroProforma { get; set; } = string.Empty;
        public DateTime? Fecha { get; set; }
        public int IdProveedor { get; set; }
        public List<ProformaPdfLineaValidadaDTO> Lineas { get; set; } = new();

    }
}
