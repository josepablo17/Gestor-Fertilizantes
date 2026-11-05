using Microsoft.AspNetCore.Mvc;
using Control_Fertilizantes_Backend.Comun.Respuestas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.DTOs.Entradas;


namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.Controladores;

[ApiController]
[Route("api/[controller]")]
public class MarcaController(IMarcaServicio servicio) : ControllerBase
{
    [HttpGet("ListarMarca")]
    public async Task<ActionResult<ApiRespuesta<IEnumerable<MarcaListarDTO>>>> Listar([FromQuery] bool soloActivos = false, [FromQuery] string? buscar = null) =>
        Ok(ApiRespuesta<IEnumerable<MarcaListarDTO>>.CrearExito("Registros obtenidos correctamente.", await servicio.ListarAsync(soloActivos, buscar)));

    [HttpGet("ObtenerMarca/{idMarca}")]
    public async Task<ActionResult<ApiRespuesta<MarcaListarDTO>>> ObtenerPorId(int idMarca)
    {
        var datos = await servicio.ObtenerPorIdAsync(idMarca);
        if (datos is null) return NotFound(ApiRespuesta<object>.CrearError("El recurso solicitado no existe."));
        return Ok(ApiRespuesta<MarcaListarDTO>.CrearExito("Registro obtenido correctamente.", datos));
    }

    [HttpPost("InsertarMarca")]
    public async Task<ActionResult<ApiRespuesta<object>>> Insertar([FromBody] MarcaCrearDTO dto)
    {
        var idMarca = await servicio.InsertarAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { idMarca },
            ApiRespuesta<object>.CrearExito("Registro creado correctamente.", new { idMarca }));
    }

    [HttpPut("ActualizarMarca")]
    public async Task<ActionResult<ApiRespuesta<object>>> Actualizar([FromBody] MarcaActualizarDTO dto)
    {
        await servicio.ActualizarAsync(dto);
        return Ok(ApiRespuesta<object>.CrearExito("Registro actualizado correctamente."));
    }

    [HttpPut("CambiarActivo/{idMarca}")]
    public async Task<ActionResult<ApiRespuesta<object>>> CambiarActivo(int idMarca, [FromBody] CambiarEstadoCatalogoDTO dto)
    {
        await servicio.CambiarActivoAsync(idMarca, dto);
        return Ok(ApiRespuesta<object>.CrearExito("Estado actualizado correctamente."));
    }

}
