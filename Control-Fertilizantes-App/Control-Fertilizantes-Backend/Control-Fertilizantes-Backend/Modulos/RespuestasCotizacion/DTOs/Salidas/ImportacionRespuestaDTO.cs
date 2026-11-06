using System.Text.Json;

namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.DTOs.Salidas;

public sealed record ImportacionRespuestaDTO(long IdImportacionDocumento, string VersionLector, string Metodo, string Estado,
    DateTimeOffset FechaImportacion, JsonElement? CamposOriginales, JsonElement? Advertencias);
