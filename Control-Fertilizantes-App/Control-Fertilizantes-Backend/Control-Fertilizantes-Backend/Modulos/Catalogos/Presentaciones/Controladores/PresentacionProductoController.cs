using Microsoft.AspNetCore.Mvc;
using Control_Fertilizantes_Backend.Comun.Respuestas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.DTOs.Salidas;

using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Salidas;

namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.Controladores;

[ApiController]
[Route("api/[controller]")]
public class PresentacionProductoController(IPresentacionProductoServicio servicio) : ControllerBase
{
    [HttpGet("ListarPresentacionesProducto")]
    public async Task<ActionResult<ApiRespuesta<IEnumerable<PresentacionProductoListarDTO>>>> Listar([FromQuery] int? idProducto = null, [FromQuery] bool soloActivos = false) =>
        Ok(ApiRespuesta<IEnumerable<PresentacionProductoListarDTO>>.CrearExito("Registros obtenidos correctamente.", await servicio.ListarAsync(idProducto, soloActivos)));

    [HttpGet("ObtenerPresentacionProducto/{idPresentacionProducto}")]
    public async Task<ActionResult<ApiRespuesta<PresentacionProductoListarDTO>>> ObtenerPorId(int idPresentacionProducto)
    {
        var datos = await servicio.ObtenerPorIdAsync(idPresentacionProducto);
        if (datos is null) return NotFound(ApiRespuesta<object>.CrearError("El recurso solicitado no existe."));
        return Ok(ApiRespuesta<PresentacionProductoListarDTO>.CrearExito("Registro obtenido correctamente.", datos));
    }

    [HttpPost("InsertarPresentacionProducto")]
    public async Task<ActionResult<ApiRespuesta<object>>> Insertar([FromBody] PresentacionProductoCrearDTO dto)
    {
        var idPresentacionProducto = await servicio.InsertarAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { idPresentacionProducto },
            ApiRespuesta<object>.CrearExito("Registro creado correctamente.", new { idPresentacionProducto }));
    }

    [HttpPut("ActualizarPresentacionProducto")]
    public async Task<ActionResult<ApiRespuesta<object>>> Actualizar([FromBody] PresentacionProductoActualizarDTO dto)
    {
        await servicio.ActualizarAsync(dto);
        return Ok(ApiRespuesta<object>.CrearExito("Registro actualizado correctamente."));
    }

    [HttpDelete("Desactivar/{idPresentacionProducto}")]
    public async Task<ActionResult<ApiRespuesta<object>>> Desactivar(int idPresentacionProducto)
    {
        await servicio.DesactivarAsync(idPresentacionProducto);
        return Ok(ApiRespuesta<object>.CrearExito("Registro desactivado correctamente."));
    }
    [HttpGet("ListarProductosDropdown")]
    public async Task<ActionResult<ApiRespuesta<IEnumerable<ProductoDropdownDTO>>>> ListarProductosDropdown() =>
        Ok(ApiRespuesta<IEnumerable<ProductoDropdownDTO>>.CrearExito("Productos obtenidos correctamente.", await servicio.ListarProductosParaDropdownAsync()));

    [HttpGet("ListarUnidadesMedidaDropdown")]
    public async Task<ActionResult<ApiRespuesta<IEnumerable<UnidadMedidaDropdownDTO>>>> ListarUnidadesMedidaDropdown() =>
        Ok(ApiRespuesta<IEnumerable<UnidadMedidaDropdownDTO>>.CrearExito("Unidades obtenidas correctamente.", await servicio.ListarUnidadesMedidaParaDropdownAsync()));
}
