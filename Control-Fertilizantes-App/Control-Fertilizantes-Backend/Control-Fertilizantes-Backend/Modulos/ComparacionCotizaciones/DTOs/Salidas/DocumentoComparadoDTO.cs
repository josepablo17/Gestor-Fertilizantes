namespace Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.DTOs.Salidas;

public sealed record DocumentoComparadoDTO(
    int IdProformaProveedor,
    long IdSolicitudCotizacionProveedor,
    int? VersionRespuesta,
    string? NumeroProforma,
    DateOnly? FechaProforma,
    DateOnly? FechaVencimiento,
    string? Moneda,
    string? EstadoConciliacion,
    string? JustificacionConciliacion,
    string? CondicionesPago,
    string? CondicionesEntrega,
    AjustesGlobalesDTO AjustesGlobales,
    decimal? TotalDocumento);
