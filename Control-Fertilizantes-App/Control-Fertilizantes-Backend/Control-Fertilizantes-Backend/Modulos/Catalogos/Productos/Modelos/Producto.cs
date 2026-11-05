namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.Modelos;

public class Producto
{
    public int IdProducto { get; set; }
    public required string Nombre { get; set; }
    public int IdProductoBase { get; set; }
    public int? IdMarca { get; set; }
    public string? Categoria { get; set; }
    public string? Descripcion { get; set; }
    public required string CodigoInterno { get; set; }
    public required string CodigoProductoBase { get; set; }
    public required string NombreProductoBase { get; set; }
    public string? FormulaDeclarada { get; set; }
    public bool ComparabilidadRevisada { get; set; }
    public string? Marca { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
}
