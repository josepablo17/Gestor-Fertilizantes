namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.DTOs.Salidas;
public class SolicitudDestinatarioDTO
{
    public long IdSolicitudCotizacionProveedor { get; set; }
    public long IdSolicitudCotizacion { get; set; }
    public int IdProveedor { get; set; }
    public required string NombreProveedor { get; set; }
    public long? IdDocumentoGenerado { get; set; }
    public required string Estado { get; set; }
    public DateTimeOffset? FechaEnvio { get; set; }
    public DateTimeOffset? FechaRespuesta { get; set; }
    public string? Observaciones { get; set; }
    public int CantidadRespuestas { get; set; }
}
