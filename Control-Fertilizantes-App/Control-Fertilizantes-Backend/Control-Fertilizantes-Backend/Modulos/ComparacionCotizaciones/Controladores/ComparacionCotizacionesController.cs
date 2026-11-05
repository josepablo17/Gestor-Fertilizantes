using Control_Fertilizantes_Backend.Comun.Respuestas;
using Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.Servicios;
using Microsoft.AspNetCore.Mvc;

namespace Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.Controladores;

[ApiController]
[Route("api/solicitudes-cotizacion/{idSolicitud:long}/comparacion")]
public sealed class ComparacionCotizacionesController(ComparacionCotizacionesServicio servicio) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiRespuesta<ComparacionSolicitudDTO>>> Comparar(long idSolicitud,
        [FromQuery] ComparacionSolicitudConsultaDTO consulta, CancellationToken cancelacion) =>
        Ok(ApiRespuesta<ComparacionSolicitudDTO>.CrearExito("Comparación de ofertas obtenida.",
            await servicio.CompararAsync(idSolicitud, consulta, cancelacion)));
}
