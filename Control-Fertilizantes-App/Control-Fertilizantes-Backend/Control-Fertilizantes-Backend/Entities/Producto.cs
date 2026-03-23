namespace Control_Fertilizantes_Backend.Entities
{
    public class Producto
    {
        public int IdProducto { get; set; }

        public string? Nombre { get; set; }

        public string? Categoria { get; set; }

        public string? Marca { get; set; }

        public string? Descripcion { get; set; }

        public bool Activo { get; set; }

        public DateTime FechaCreacion { get; set; }

        public DateTime? FechaModificacion { get; set; }
    }
}
