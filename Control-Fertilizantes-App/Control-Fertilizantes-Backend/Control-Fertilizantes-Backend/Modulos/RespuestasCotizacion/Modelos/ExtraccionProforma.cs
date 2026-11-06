namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Modelos;

public sealed record CampoPdf(string Nombre, string? Valor);
public sealed record AdvertenciaLectura(string Codigo, string Mensaje, string? Campo = null);
public sealed record ExtraccionProforma(string VersionLector, string Metodo, string Estado, string? VersionPlantilla,
    IReadOnlyList<CampoPdf> Campos, IReadOnlyList<AdvertenciaLectura> Advertencias);
