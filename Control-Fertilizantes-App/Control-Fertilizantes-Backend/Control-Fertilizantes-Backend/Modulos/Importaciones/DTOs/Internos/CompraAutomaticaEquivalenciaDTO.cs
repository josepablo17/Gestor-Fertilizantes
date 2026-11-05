namespace Control_Fertilizantes_Backend.Modulos.Importaciones.DTOs.Internos
{
    public class CompraAutomaticaEquivalenciaDTO
    {
        public int IdProducto { get; set; }
        public int? IdPresentacionProducto { get; set; }
        public string NombreProducto { get; set; } = string.Empty;
        public string NombrePresentacion { get; set; } = string.Empty;
    }
}
