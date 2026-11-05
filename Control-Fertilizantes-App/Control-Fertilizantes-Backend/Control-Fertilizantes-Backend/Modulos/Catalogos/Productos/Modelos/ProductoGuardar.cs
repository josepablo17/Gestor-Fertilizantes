namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.Modelos;

// Datos normalizados para persistir; separados de las entradas HTTP y de las consultas.
public class ProductoGuardar
{
    public int IdProducto { get; set; }
    public required string Nombre { get; set; }
    public int IdProductoBase { get; set; }
    public int? IdMarca { get; set; }
    public string? Categoria { get; set; }
    public string? Descripcion { get; set; }
    public string? CodigoInterno { get; set; }
}
