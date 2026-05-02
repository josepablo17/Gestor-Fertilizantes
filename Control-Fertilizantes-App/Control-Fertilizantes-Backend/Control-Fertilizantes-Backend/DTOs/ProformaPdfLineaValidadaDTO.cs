namespace Control_Fertilizantes_Backend.DTOs
{
    public class ProformaPdfLineaValidadaDTO
    {
        public string Codigo { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public decimal Cantidad { get; set; }
        public decimal Precio { get; set; }
        public decimal DescuentoPorcentaje { get; set; }
        public decimal Sugerido { get; set; }
        public decimal TotalLinea { get; set; }

        public int? IdProducto { get; set; }
        public int? IdPresentacionProducto { get; set; }

        public string NombreProductoSistema { get; set; } = string.Empty;
        public string NombrePresentacionSistema { get; set; } = string.Empty;

        public bool ProductoEncontrado { get; set; }
        public bool PresentacionEncontrada { get; set; }
        public bool SePuedeRegistrar { get; set; }

        public string ObservacionValidacion { get; set; } = string.Empty;
    }
}
