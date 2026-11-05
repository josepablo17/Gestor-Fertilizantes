namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Modelos;
public class Solicitud
{
    public long IdSolicitudCotizacion { get; set; }
    public required string NumeroSolicitud { get; set; }
    public int VersionSolicitud { get; set; }
    public long? IdSolicitudAnterior { get; set; }
    public DateTime FechaSolicitud { get; set; }
    public DateTime? FechaLimiteRespuesta { get; set; }
    public required string Estado { get; set; }
    public string? DatosClienteOriginalJson { get; set; }
    public string? Observaciones { get; set; }
    public DateTime? FechaEmision { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public List<SolicitudLinea> Lineas { get; set; } = [];
    public List<SolicitudDestinatario> Destinatarios { get; set; } = [];
}
