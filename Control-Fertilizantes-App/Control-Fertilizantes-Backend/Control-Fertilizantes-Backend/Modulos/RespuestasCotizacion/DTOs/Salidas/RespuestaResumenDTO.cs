namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.DTOs.Salidas;

public sealed record RespuestaResumenDTO(
    int IdProformaProveedor,
    long IdSolicitudCotizacion,
    long IdSolicitudCotizacionProveedor,
    int IdProveedor,
    int VersionRespuesta,
    int? IdProformaAnterior,
    string NombreProveedor,
    string Estado,
    string EstadoConciliacion,
    string? JustificacionConciliacion,
    DateTimeOffset FechaCreacion,
    DateTimeOffset? FechaValidacion,
    string? NumeroProforma,
    string? Moneda,
    decimal? Total);
