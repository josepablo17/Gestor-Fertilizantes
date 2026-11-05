using Microsoft.AspNetCore.Mvc;
using Control_Fertilizantes_Backend.Comun.Respuestas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.DTOs.Salidas;



namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.Controladores;

[ApiController]
[Route("api/[controller]")]
public class ProductoController(IProductoServicio servicio) : ControllerBase
{
    [HttpGet("ListarProducto")]
    public async Task<ActionResult<ApiRespuesta<IEnumerable<ProductoListarDTO>>>> Listar([FromQuery] bool soloActivos = false, [FromQuery] string? buscar = null, [FromQuery] int? idProductoBase = null, [FromQuery] int? idMarca = null) =>
        Ok(ApiRespuesta<IEnumerable<ProductoListarDTO>>.CrearExito("Registros obtenidos correctamente.", await servicio.ListarAsync(soloActivos, buscar, idProductoBase, idMarca)));

    [HttpGet("ObtenerProducto/{idProducto}")]
    public async Task<ActionResult<ApiRespuesta<ProductoListarDTO>>> ObtenerPorId(int idProducto)
    {
        var datos = await servicio.ObtenerPorIdAsync(idProducto);
        if (datos is null) return NotFound(ApiRespuesta<object>.CrearError("El recurso solicitado no existe."));
        return Ok(ApiRespuesta<ProductoListarDTO>.CrearExito("Registro obtenido correctamente.", datos));
    }

    [HttpPost("InsertarProducto")]
    public async Task<ActionResult<ApiRespuesta<object>>> Insertar([FromBody] ProductoCrearDTO dto)
    {
        var idProducto = await servicio.InsertarAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { idProducto },
            ApiRespuesta<object>.CrearExito("Registro creado correctamente.", new { idProducto }));
    }

    [HttpPut("ActualizarProducto")]
    public async Task<ActionResult<ApiRespuesta<object>>> Actualizar([FromBody] ProductoActualizarDTO dto)
    {
        await servicio.ActualizarAsync(dto);
        return Ok(ApiRespuesta<object>.CrearExito("Registro actualizado correctamente."));
    }

    [HttpDelete("Desactivar/{idProducto}")]
    public async Task<ActionResult<ApiRespuesta<object>>> Desactivar(int idProducto)
    {
        await servicio.DesactivarAsync(idProducto);
        return Ok(ApiRespuesta<object>.CrearExito("Registro desactivado correctamente."));
    }

}
