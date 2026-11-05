using Microsoft.AspNetCore.Mvc;
using Control_Fertilizantes_Backend.Comun.Respuestas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.DTOs.Salidas;



namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.Controladores;

[ApiController]
[Route("api/[controller]")]
public class ProveedorController(IProveedorServicio servicio) : ControllerBase
{
    [HttpGet("ListarProveedor")]
    public async Task<ActionResult<ApiRespuesta<IEnumerable<ProveedorListarDTO>>>> Listar([FromQuery] bool soloActivos = false, [FromQuery] string? buscar = null) =>
        Ok(ApiRespuesta<IEnumerable<ProveedorListarDTO>>.CrearExito("Registros obtenidos correctamente.", await servicio.ListarAsync(soloActivos, buscar)));

    [HttpGet("ObtenerProveedor/{idProveedor}")]
    public async Task<ActionResult<ApiRespuesta<ProveedorListarDTO>>> ObtenerPorId(int idProveedor)
    {
        var datos = await servicio.ObtenerPorIdAsync(idProveedor);
        if (datos is null) return NotFound(ApiRespuesta<object>.CrearError("El recurso solicitado no existe."));
        return Ok(ApiRespuesta<ProveedorListarDTO>.CrearExito("Registro obtenido correctamente.", datos));
    }

    [HttpPost("InsertarProveedor")]
    public async Task<ActionResult<ApiRespuesta<object>>> Insertar([FromBody] ProveedorCrearDTO dto)
    {
        var idProveedor = await servicio.InsertarAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { idProveedor },
            ApiRespuesta<object>.CrearExito("Registro creado correctamente.", new { idProveedor }));
    }

    [HttpPut("ActualizarProveedor")]
    public async Task<ActionResult<ApiRespuesta<object>>> Actualizar([FromBody] ProveedorActualizarDTO dto)
    {
        await servicio.ActualizarAsync(dto);
        return Ok(ApiRespuesta<object>.CrearExito("Registro actualizado correctamente."));
    }

    [HttpDelete("Desactivar/{idProveedor}")]
    public async Task<ActionResult<ApiRespuesta<object>>> Desactivar(int idProveedor)
    {
        await servicio.DesactivarAsync(idProveedor);
        return Ok(ApiRespuesta<object>.CrearExito("Registro desactivado correctamente."));
    }

}
