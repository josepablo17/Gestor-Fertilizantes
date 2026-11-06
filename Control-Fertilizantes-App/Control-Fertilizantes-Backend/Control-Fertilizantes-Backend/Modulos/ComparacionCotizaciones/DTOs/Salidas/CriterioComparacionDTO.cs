namespace Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.DTOs.Salidas;

public sealed record CriterioComparacionDTO(
    string Moneda,
    string BaseTotalLinea,
    DateOnly FechaReferencia,
    bool IncluirAlternativas,
    long? IdSolicitudCotizacionDetalle,
    string? TipoBase);
