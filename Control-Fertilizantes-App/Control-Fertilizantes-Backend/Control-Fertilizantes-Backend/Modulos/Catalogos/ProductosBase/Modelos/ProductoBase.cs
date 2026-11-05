namespace Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.Modelos;

public class ProductoBase
{
    public int IdProductoBase { get; set; }
    public required string Codigo { get; set; }
    public required string Nombre { get; set; }
    public string? FormulaDeclarada { get; set; }
    public string? Descripcion { get; set; }
    public bool ComparabilidadRevisada { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
}
