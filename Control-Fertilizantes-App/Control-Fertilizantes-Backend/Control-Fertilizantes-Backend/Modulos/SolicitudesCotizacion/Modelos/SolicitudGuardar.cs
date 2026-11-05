namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Modelos;
public class SolicitudGuardar
{
    public required string NumeroSolicitud { get; init; }
    public DateTime FechaSolicitud { get; init; }
    public DateTime? FechaLimiteRespuesta { get; init; }
    public string? DatosClienteOriginalJson { get; init; }
    public string? Observaciones { get; init; }
    public required string LineasJson { get; init; }
    public required string ProveedoresJson { get; init; }
}
