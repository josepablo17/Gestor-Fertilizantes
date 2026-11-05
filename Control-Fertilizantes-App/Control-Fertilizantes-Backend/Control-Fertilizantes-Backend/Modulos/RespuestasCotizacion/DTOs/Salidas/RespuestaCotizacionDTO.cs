using System.Text.Json;
using Control_Fertilizantes_Backend.Modulos.Documentos.DTOs.Salidas;

namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.DTOs.Salidas;

public sealed record RespuestaCotizacionDTO(RespuestaResumenDTO Respuesta, CabeceraRespuestaDTO Cabecera,
    IReadOnlyList<LineaRespuestaDTO> Lineas, DocumentoRespuestaDTO? Documento, ImportacionRespuestaDTO? Importacion,
    IReadOnlyList<CambioRespuestaDTO> Historial);

public sealed record CambioRespuestaDTO(long IdCambioCotizacion, int? IdProformaProveedorDetalle, string Origen,
    string? Motivo, DateTimeOffset FechaCambio, JsonElement Cambios);
