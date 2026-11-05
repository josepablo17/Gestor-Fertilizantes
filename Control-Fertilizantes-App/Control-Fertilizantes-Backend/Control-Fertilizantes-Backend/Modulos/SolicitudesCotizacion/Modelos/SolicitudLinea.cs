namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Modelos;
public class SolicitudLinea
{
    public long IdSolicitudCotizacionDetalle { get; set; }
    public long IdSolicitudCotizacion { get; set; }
    public int NumeroLinea { get; set; }
    public int IdProducto { get; set; }
    public int IdPresentacionProducto { get; set; }
    public decimal CantidadEmpaquesSolicitada { get; set; }
    public required string NombreProductoOriginal { get; set; }
    public string? MarcaOriginal { get; set; }
    public required string PresentacionOriginal { get; set; }
    public decimal ContenidoEmpaqueOriginal { get; set; }
    public int IdUnidadMedidaOriginal { get; set; }
    public required string CodigoUnidadOriginal { get; set; }
    public required string TipoBaseOriginal { get; set; }
    public decimal FactorConversionOriginal { get; set; }
    public decimal ContenidoNormalizadoOriginal { get; set; }
    public bool PermiteAlternativas { get; set; }
    public string? Observaciones { get; set; }
}
