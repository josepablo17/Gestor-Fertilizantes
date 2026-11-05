namespace Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.Modelos;

// Datos normalizados para persistir; separados de las entradas HTTP y de las consultas.
public class ProductoBaseGuardar
{
    public int IdProductoBase { get; set; }
    public required string Codigo { get; set; }
    public required string Nombre { get; set; }
    public string? FormulaDeclarada { get; set; }
    public string? Descripcion { get; set; }
    public bool ComparabilidadRevisada { get; set; }
}
