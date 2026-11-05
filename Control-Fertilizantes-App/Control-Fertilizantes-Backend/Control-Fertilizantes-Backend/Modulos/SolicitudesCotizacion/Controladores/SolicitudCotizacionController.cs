using Microsoft.AspNetCore.Mvc;
using Control_Fertilizantes_Backend.Comun.Paginacion;
using Control_Fertilizantes_Backend.Comun.Respuestas;
using Control_Fertilizantes_Backend.Modulos.Documentos.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Contratos;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.DTOs.Salidas;

namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Controladores;

[ApiController]
[Route("api/solicitudes-cotizacion")]
public class SolicitudCotizacionController(ISolicitudServicio servicio) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiRespuesta<PaginaRespuesta<SolicitudListadoDTO>>>> Listar([FromQuery] SolicitudConsultaDTO consulta, CancellationToken cancelacion) =>
        Ok(ApiRespuesta<PaginaRespuesta<SolicitudListadoDTO>>.CrearExito("Solicitudes obtenidas correctamente.", await servicio.ListarAsync(consulta, cancelacion)));

    [HttpGet("{idSolicitud:long}")]
    public async Task<ActionResult<ApiRespuesta<SolicitudRespuestaDTO>>> Obtener(long idSolicitud, CancellationToken cancelacion) =>
        Ok(ApiRespuesta<SolicitudRespuestaDTO>.CrearExito("Solicitud obtenida correctamente.", await servicio.ObtenerAsync(idSolicitud, cancelacion)));

    [HttpPost]
    public async Task<ActionResult<ApiRespuesta<SolicitudRespuestaDTO>>> Crear([FromBody] SolicitudGuardarBorradorDTO entrada, CancellationToken cancelacion)
    {
        var solicitud = await servicio.GuardarBorradorAsync(null, entrada, cancelacion);
        return CreatedAtAction(nameof(Obtener), new { idSolicitud = solicitud.IdSolicitudCotizacion }, ApiRespuesta<SolicitudRespuestaDTO>.CrearExito("Borrador creado correctamente.", solicitud));
    }

    [HttpPut("{idSolicitud:long}/borrador")]
    public async Task<ActionResult<ApiRespuesta<SolicitudRespuestaDTO>>> Actualizar(long idSolicitud, [FromBody] SolicitudGuardarBorradorDTO entrada, CancellationToken cancelacion) =>
        Ok(ApiRespuesta<SolicitudRespuestaDTO>.CrearExito("Borrador reemplazado correctamente.", await servicio.GuardarBorradorAsync(idSolicitud, entrada, cancelacion)));

    [HttpPost("{idSolicitud:long}/emision")]
    public async Task<ActionResult<ApiRespuesta<SolicitudRespuestaDTO>>> Emitir(long idSolicitud, CancellationToken cancelacion) =>
        Ok(ApiRespuesta<SolicitudRespuestaDTO>.CrearExito("Solicitud emitida. Su contenido queda fijo.", await servicio.EmitirAsync(idSolicitud, cancelacion)));

    [HttpPost("{idSolicitud:long}/revisiones")]
    public async Task<ActionResult<ApiRespuesta<SolicitudRespuestaDTO>>> CrearRevision(long idSolicitud, CancellationToken cancelacion)
    {
        var revision = await servicio.CrearRevisionAsync(idSolicitud, cancelacion);
        return CreatedAtAction(nameof(Obtener), new { idSolicitud = revision.IdSolicitudCotizacion }, ApiRespuesta<SolicitudRespuestaDTO>.CrearExito("Nueva versión en borrador creada correctamente.", revision));
    }

    [HttpPut("{idSolicitud:long}/estado")]
    public async Task<ActionResult<ApiRespuesta<SolicitudRespuestaDTO>>> CambiarEstado(long idSolicitud, [FromBody] SolicitudEstadoDTO entrada, CancellationToken cancelacion) =>
        Ok(ApiRespuesta<SolicitudRespuestaDTO>.CrearExito("Estado de la solicitud actualizado.", await servicio.CambiarEstadoAsync(idSolicitud, entrada, cancelacion)));

    [HttpPost("{idSolicitud:long}/destinatarios/{idDestinatario:long}/documento")]
    public async Task<ActionResult<ApiRespuesta<DocumentoRespuestaDTO>>> GenerarDocumento(long idSolicitud, long idDestinatario, CancellationToken cancelacion) =>
        Ok(ApiRespuesta<DocumentoRespuestaDTO>.CrearExito("PDF original disponible.", await servicio.GenerarDocumentoAsync(idSolicitud, idDestinatario, cancelacion)));

    [HttpGet("{idSolicitud:long}/destinatarios/{idDestinatario:long}/documento")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK, "application/pdf")]
    public async Task<IActionResult> DescargarDocumento(long idSolicitud, long idDestinatario, CancellationToken cancelacion)
    {
        var archivo = await servicio.DescargarDocumentoAsync(idSolicitud, idDestinatario, cancelacion);
        return File(archivo.Contenido, "application/pdf", archivo.Nombre);
    }

    [HttpPost("{idSolicitud:long}/destinatarios/{idDestinatario:long}/envios")]
    public async Task<ActionResult<ApiRespuesta<SolicitudRespuestaDTO>>> RegistrarEnvio(long idSolicitud, long idDestinatario, [FromBody] SolicitudEnvioDTO entrada, CancellationToken cancelacion) =>
        Ok(ApiRespuesta<SolicitudRespuestaDTO>.CrearExito("Evidencia de envío registrada. Esta operación no envía correos.", await servicio.RegistrarEnvioAsync(idSolicitud, idDestinatario, entrada, cancelacion)));
}
