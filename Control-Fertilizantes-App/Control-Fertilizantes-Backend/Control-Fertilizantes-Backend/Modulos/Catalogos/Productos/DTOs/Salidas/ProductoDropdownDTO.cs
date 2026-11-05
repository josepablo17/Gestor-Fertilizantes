namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.DTOs.Salidas
{
    public class ProductoDropdownDTO
    {
        public int IdProducto { get; set; }
        public string? Nombre { get; set; }
        public required string CodigoInterno { get; set; }
        public int IdProductoBase { get; set; }
        public required string NombreProductoBase { get; set; }
        public int? IdMarca { get; set; }
        public string? Marca { get; set; }
    }
}
