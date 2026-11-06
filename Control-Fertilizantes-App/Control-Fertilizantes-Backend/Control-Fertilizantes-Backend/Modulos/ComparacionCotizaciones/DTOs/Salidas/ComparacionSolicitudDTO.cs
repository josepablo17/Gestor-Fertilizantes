namespace Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.DTOs.Salidas;

public sealed record ComparacionSolicitudDTO(
    long IdSolicitudCotizacion,
    CriterioComparacionDTO Criterio,
    IReadOnlyList<LineaComparadaDTO> Lineas,
    IReadOnlyList<DocumentoComparadoDTO> Documentos);
