namespace Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.Modelos;

// Datos normalizados para persistir; separados de las entradas HTTP y de las consultas.
public class UnidadMedidaGuardar
{
    public int IdUnidadMedida { get; set; }
    public required string Codigo { get; set; }
    public required string Nombre { get; set; }
    public required string TipoBase { get; set; }
    public decimal FactorConversion { get; set; }
    public bool EsUnidadBase { get; set; }
}
