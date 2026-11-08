using Control_Fertilizantes_Backend.Comun.Paginacion;
using Control_Fertilizantes_Backend.Comun.Respuestas;
using Control_Fertilizantes_Backend.Modulos.Documentos.Modelos;
using Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Servicios;
using Microsoft.AspNetCore.Mvc;

namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Controladores;

[ApiController]
[Route("api/respuestas-cotizacion")]
public sealed class RespuestaCotizacionController(RespuestaCotizacionServicio servicio) : ControllerBase
{
    private const string RutaDestinatario = "~/api/solicitudes-cotizacion/{idSolicitud:long}/destinatarios/{idDestinatario:long}/respuestas";

    [HttpPost(RutaDestinatario)]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiRespuesta<RespuestaCotizacionDTO>), StatusCodes.Status201Created)]
    [RequestSizeLimit(LimitesPdf.Bytes + 64 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = LimitesPdf.Bytes)]
    public async Task<ActionResult<ApiRespuesta<RespuestaCotizacionDTO>>> Recibir(long idSolicitud, long idDestinatario,
        [FromForm] RecibirRespuestaDTO entrada, CancellationToken ct)
    {
        await using var archivo = entrada.Archivo.OpenReadStream();
        var respuesta = await servicio.RecibirAsync(idSolicitud, idDestinatario, entrada.Archivo.FileName, archivo, entrada.Archivo.Length, ct);
        return CreatedAtAction(nameof(Obtener), new { idRespuesta = respuesta.Respuesta.IdProformaProveedor },
            ApiRespuesta<RespuestaCotizacionDTO>.CrearExito("PDF recibido. Revise el borrador antes de validar.", respuesta));
    }

    [HttpGet(RutaDestinatario)]
    public async Task<ActionResult<ApiRespuesta<PaginaRespuesta<RespuestaResumenDTO>>>> Listar(long idSolicitud, long idDestinatario,
        CancellationToken ct, [FromQuery] int pagina = 1, [FromQuery] int tamanoPagina = 50) =>
        Ok(ApiRespuesta<PaginaRespuesta<RespuestaResumenDTO>>.CrearExito("Respuestas obtenidas.",
            await servicio.ListarAsync(idSolicitud, idDestinatario, pagina, tamanoPagina, ct)));

    [HttpGet("{idRespuesta:int}")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<ActionResult<ApiRespuesta<RespuestaCotizacionDTO>>> Obtener(int idRespuesta, CancellationToken ct) =>
        Ok(Exito("Respuesta obtenida.", await servicio.ObtenerAsync(idRespuesta, ct)));

    [HttpGet("{idRespuesta:int}/documento")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK, "application/pdf")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> Descargar(int idRespuesta, CancellationToken ct)
    {
        var archivo = await servicio.DescargarAsync(idRespuesta, ct);
        return File(archivo.Contenido, "application/pdf", archivo.Nombre);
    }

    [HttpPut("{idRespuesta:int}/cabecera")]
    public async Task<ActionResult<ApiRespuesta<RespuestaCotizacionDTO>>> AjustarCabecera(int idRespuesta, AjustarCabeceraRespuestaDTO entrada, CancellationToken ct) =>
        Ok(Exito("Cabecera actualizada.", await servicio.AjustarCabeceraAsync(idRespuesta, entrada, ct)));

    [HttpPost("{idRespuesta:int}/lineas")]
    public async Task<ActionResult<ApiRespuesta<RespuestaCotizacionDTO>>> AgregarLinea(int idRespuesta, AjustarLineaRespuestaDTO entrada, CancellationToken ct) =>
        Ok(Exito("Renglón agregado para revisión.", await servicio.GuardarLineaAsync(idRespuesta, null, entrada, ct)));

    [HttpPut("{idRespuesta:int}/lineas/{idLinea:int}")]
    public async Task<ActionResult<ApiRespuesta<RespuestaCotizacionDTO>>> AjustarLinea(int idRespuesta, int idLinea, AjustarLineaRespuestaDTO entrada, CancellationToken ct) =>
        Ok(Exito("Renglón actualizado. Confirme la revisión nuevamente.", await servicio.GuardarLineaAsync(idRespuesta, idLinea, entrada, ct)));

    [HttpPost("{idRespuesta:int}/lineas/{idLinea:int}/revision")]
    public async Task<ActionResult<ApiRespuesta<RespuestaCotizacionDTO>>> RevisarLinea(int idRespuesta, int idLinea, RevisionLineaRespuestaDTO entrada, CancellationToken ct) =>
        Ok(Exito("Renglón revisado.", await servicio.RevisarLineaAsync(idRespuesta, idLinea, entrada, ct)));

    [HttpPost("{idRespuesta:int}/conciliacion")]
    public async Task<ActionResult<ApiRespuesta<RespuestaCotizacionDTO>>> Conciliar(int idRespuesta, ConciliarRespuestaDTO entrada, CancellationToken ct) =>
        Ok(Exito("Conciliación registrada.", await servicio.ConciliarAsync(idRespuesta, entrada, ct)));

    [HttpPost("{idRespuesta:int}/validacion")]
    public async Task<ActionResult<ApiRespuesta<RespuestaCotizacionDTO>>> Validar(int idRespuesta, CancellationToken ct) =>
        Ok(Exito("Respuesta validada.", await servicio.ValidarAsync(idRespuesta, ct)));

    [HttpPost("{idRespuesta:int}/cancelacion")]
    public async Task<ActionResult<ApiRespuesta<RespuestaCotizacionDTO>>> Cancelar(int idRespuesta, MotivoRespuestaDTO entrada, CancellationToken ct) =>
        Ok(Exito("Borrador cancelado. Se conserva el documento.", await servicio.CancelarAsync(idRespuesta, entrada, ct)));

    [HttpPost("{idRespuesta:int}/revisiones")]
    [ProducesResponseType(typeof(ApiRespuesta<RespuestaCotizacionDTO>), StatusCodes.Status201Created)]
    public async Task<ActionResult<ApiRespuesta<RespuestaCotizacionDTO>>> CrearRevision(int idRespuesta, CancellationToken ct)
    {
        var revision = await servicio.CrearRevisionAsync(idRespuesta, ct);
        return CreatedAtAction(nameof(Obtener), new { idRespuesta = revision.Respuesta.IdProformaProveedor },
            Exito("Nueva revisión creada como borrador.", revision));
    }

    private static ApiRespuesta<RespuestaCotizacionDTO> Exito(string mensaje, RespuestaCotizacionDTO datos) =>
        ApiRespuesta<RespuestaCotizacionDTO>.CrearExito(mensaje, datos);
}
