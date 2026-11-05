using System.Text.Json;
namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.DTOs.Salidas;
public class SolicitudRespuestaDTO
{
    public long IdSolicitudCotizacion { get; init; }
    public required string NumeroSolicitud { get; init; }
    public int VersionSolicitud { get; init; }
    public long? IdSolicitudAnterior { get; init; }
    public DateOnly FechaSolicitud { get; init; }
    public DateOnly? FechaLimiteRespuesta { get; init; }
    public required string Estado { get; init; }
    public JsonElement? DatosCliente { get; init; }
    public string? Observaciones { get; init; }
    public DateTimeOffset? FechaEmision { get; init; }
    public DateTimeOffset FechaCreacion { get; init; }
    public DateTimeOffset? FechaModificacion { get; init; }
    public IReadOnlyList<SolicitudLineaDTO> Lineas { get; init; } = [];
    public IReadOnlyList<SolicitudDestinatarioDTO> Destinatarios { get; init; } = [];
}
