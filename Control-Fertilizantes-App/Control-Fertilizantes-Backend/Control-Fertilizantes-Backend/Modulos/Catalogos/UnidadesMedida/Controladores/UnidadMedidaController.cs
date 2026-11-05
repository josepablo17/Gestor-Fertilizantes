using Microsoft.AspNetCore.Mvc;
using Control_Fertilizantes_Backend.Comun.Respuestas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Salidas;



namespace Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.Controladores;

[ApiController]
[Route("api/[controller]")]
public class UnidadMedidaController(IUnidadMedidaServicio servicio) : ControllerBase
{
    [HttpGet("ListarUnidadMedida")]
    public async Task<ActionResult<ApiRespuesta<IEnumerable<UnidadMedidaListarDTO>>>> Listar([FromQuery] bool soloActivos = false) =>
        Ok(ApiRespuesta<IEnumerable<UnidadMedidaListarDTO>>.CrearExito("Registros obtenidos correctamente.", await servicio.ListarAsync(soloActivos)));

    [HttpGet("ObtenerUnidadMedida/{idUnidadMedida}")]
    public async Task<ActionResult<ApiRespuesta<UnidadMedidaListarDTO>>> ObtenerPorId(int idUnidadMedida)
    {
        var datos = await servicio.ObtenerPorIdAsync(idUnidadMedida);
        if (datos is null) return NotFound(ApiRespuesta<object>.CrearError("El recurso solicitado no existe."));
        return Ok(ApiRespuesta<UnidadMedidaListarDTO>.CrearExito("Registro obtenido correctamente.", datos));
    }

    [HttpPost("InsertarUnidadMedida")]
    public async Task<ActionResult<ApiRespuesta<object>>> Insertar([FromBody] UnidadMedidaCrearDTO dto)
    {
        var idUnidadMedida = await servicio.InsertarAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { idUnidadMedida },
            ApiRespuesta<object>.CrearExito("Registro creado correctamente.", new { idUnidadMedida }));
    }

    [HttpPut("ActualizarUnidadMedida")]
    public async Task<ActionResult<ApiRespuesta<object>>> Actualizar([FromBody] UnidadMedidaActualizarDTO dto)
    {
        await servicio.ActualizarAsync(dto);
        return Ok(ApiRespuesta<object>.CrearExito("Registro actualizado correctamente."));
    }

    [HttpDelete("Desactivar/{idUnidadMedida}")]
    public async Task<ActionResult<ApiRespuesta<object>>> Desactivar(int idUnidadMedida)
    {
        await servicio.DesactivarAsync(idUnidadMedida);
        return Ok(ApiRespuesta<object>.CrearExito("Registro desactivado correctamente."));
    }

}
