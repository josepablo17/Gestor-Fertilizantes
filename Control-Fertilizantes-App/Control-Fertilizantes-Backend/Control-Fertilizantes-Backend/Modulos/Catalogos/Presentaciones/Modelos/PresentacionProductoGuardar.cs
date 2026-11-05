namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.Modelos;

// Datos normalizados para persistir; separados de las entradas HTTP y de las consultas.
public class PresentacionProductoGuardar
{
    public int IdPresentacionProducto { get; set; }
    public int IdProducto { get; set; }
    public required string Descripcion { get; set; }
    public decimal Cantidad { get; set; }
    public int IdUnidadMedida { get; set; }
}
