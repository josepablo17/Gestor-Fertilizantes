namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.DTOs.Salidas;

public class PresentacionProductoListarDTO
{
    public int IdPresentacionProducto { get; set; }
    public int IdProducto { get; set; }
    public required string Descripcion { get; set; }
    public decimal Cantidad { get; set; }
    public int IdUnidadMedida { get; set; }
    public required string NombreProducto { get; set; }
    public int IdProductoBase { get; set; }
    public int? IdMarca { get; set; }
    public string? Marca { get; set; }
    public required string CodigoUnidadMedida { get; set; }
    public required string NombreUnidadMedida { get; set; }
    public required string TipoBase { get; set; }
    public decimal FactorConversion { get; set; }
    public decimal CantidadNormalizada { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
}
