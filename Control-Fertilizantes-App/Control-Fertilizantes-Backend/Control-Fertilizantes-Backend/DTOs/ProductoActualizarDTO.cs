namespace Control_Fertilizantes_Backend.DTOs
{
    public class ProductoActualizarDTO
    {
        public int IdProducto { get; set; }

        public string? Nombre { get; set; }

        public string? Categoria { get; set; }

        public string? Marca { get; set; }

        public string? Descripcion { get; set; }
    }
}
