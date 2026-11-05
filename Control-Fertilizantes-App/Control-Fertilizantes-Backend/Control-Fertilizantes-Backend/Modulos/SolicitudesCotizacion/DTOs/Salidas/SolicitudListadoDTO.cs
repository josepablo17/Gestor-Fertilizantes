namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.DTOs.Salidas;
public class SolicitudListadoDTO
{
    public long IdSolicitudCotizacion { get; init; }
    public required string NumeroSolicitud { get; init; }
    public int VersionSolicitud { get; init; }
    public DateOnly FechaSolicitud { get; init; }
    public DateOnly? FechaLimiteRespuesta { get; init; }
    public required string Estado { get; init; }
    public int CantidadLineas { get; init; }
    public int CantidadProveedores { get; init; }
}
