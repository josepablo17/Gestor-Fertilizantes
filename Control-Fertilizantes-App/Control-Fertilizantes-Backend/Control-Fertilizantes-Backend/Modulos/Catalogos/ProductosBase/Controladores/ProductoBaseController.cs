using Microsoft.AspNetCore.Mvc;
using Control_Fertilizantes_Backend.Comun.Respuestas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.DTOs.Entradas;


namespace Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.Controladores;

[ApiController]
[Route("api/[controller]")]
public class ProductoBaseController(IProductoBaseServicio servicio) : ControllerBase
{
    [HttpGet("ListarProductoBase")]
    public async Task<ActionResult<ApiRespuesta<IEnumerable<ProductoBaseListarDTO>>>> Listar([FromQuery] bool soloActivos = false, [FromQuery] string? buscar = null) =>
        Ok(ApiRespuesta<IEnumerable<ProductoBaseListarDTO>>.CrearExito("Registros obtenidos correctamente.", await servicio.ListarAsync(soloActivos, buscar)));

    [HttpGet("ObtenerProductoBase/{idProductoBase}")]
    public async Task<ActionResult<ApiRespuesta<ProductoBaseListarDTO>>> ObtenerPorId(int idProductoBase)
    {
        var datos = await servicio.ObtenerPorIdAsync(idProductoBase);
        if (datos is null) return NotFound(ApiRespuesta<object>.CrearError("El recurso solicitado no existe."));
        return Ok(ApiRespuesta<ProductoBaseListarDTO>.CrearExito("Registro obtenido correctamente.", datos));
    }

    [HttpPost("InsertarProductoBase")]
    public async Task<ActionResult<ApiRespuesta<object>>> Insertar([FromBody] ProductoBaseCrearDTO dto)
    {
        var idProductoBase = await servicio.InsertarAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { idProductoBase },
            ApiRespuesta<object>.CrearExito("Registro creado correctamente.", new { idProductoBase }));
    }

    [HttpPut("ActualizarProductoBase")]
    public async Task<ActionResult<ApiRespuesta<object>>> Actualizar([FromBody] ProductoBaseActualizarDTO dto)
    {
        await servicio.ActualizarAsync(dto);
        return Ok(ApiRespuesta<object>.CrearExito("Registro actualizado correctamente."));
    }

    [HttpPut("CambiarActivo/{idProductoBase}")]
    public async Task<ActionResult<ApiRespuesta<object>>> CambiarActivo(int idProductoBase, [FromBody] CambiarEstadoCatalogoDTO dto)
    {
        await servicio.CambiarActivoAsync(idProductoBase, dto);
        return Ok(ApiRespuesta<object>.CrearExito("Estado actualizado correctamente."));
    }

}
