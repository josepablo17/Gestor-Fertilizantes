namespace Control_Fertilizantes_Backend.DTOs
{
    public class ProformaPdfLineaDTO
    {
        public string Codigo { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public decimal Cantidad { get; set; }
        public decimal Precio { get; set; }
        public decimal DescuentoPorcentaje { get; set; }
        public decimal Sugerido { get; set; }
        public decimal TotalLinea { get; set; }
    }
}
