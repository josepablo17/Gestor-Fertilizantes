namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Modelos;

public sealed record RespuestaCompleta(RespuestaRegistro Cabecera, IReadOnlyList<LineaRespuestaRegistro> Lineas,
    IReadOnlyList<CambioRespuestaRegistro> Historial);

public sealed record BorradorRespuesta(CabeceraGuardarRespuesta Cabecera, IReadOnlyList<LineaGuardarRespuesta> Lineas, ExtraccionProforma Extraccion);

public sealed class ConfirmacionRespuestaIncierta(Exception causa)
    : Exception("No se pudo confirmar el resultado del registro de la proforma.", causa);
