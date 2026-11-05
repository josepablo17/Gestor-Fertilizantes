namespace Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.Modelos;

public sealed record CriterioComparacion(long IdSolicitudCotizacion, string Moneda, string BaseTotalLinea,
    DateOnly FechaReferencia, bool IncluirAlternativas, long? IdSolicitudCotizacionDetalle, string? TipoBase);
