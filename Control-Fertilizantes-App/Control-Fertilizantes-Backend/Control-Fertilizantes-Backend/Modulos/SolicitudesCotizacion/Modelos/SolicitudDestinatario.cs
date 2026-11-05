namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Modelos;
public class SolicitudDestinatario
{
    public long IdSolicitudCotizacionProveedor { get; set; }
    public long IdSolicitudCotizacion { get; set; }
    public int IdProveedor { get; set; }
    public required string NombreProveedor { get; set; }
    public long? IdDocumentoEnviado { get; set; }
    public required string Estado { get; set; }
    public DateTime? FechaEnvio { get; set; }
    public DateTime? FechaRespuesta { get; set; }
    public string? Observaciones { get; set; }
    public int CantidadRespuestas { get; set; }
}
