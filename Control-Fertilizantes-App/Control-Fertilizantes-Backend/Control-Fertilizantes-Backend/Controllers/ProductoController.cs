using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Control_Fertilizantes_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductoController : ControllerBase
    {
        private readonly IProductoServicio _productoServicio;

        public ProductoController(IProductoServicio productoServicio)
        {
            _productoServicio = productoServicio;
        }

        [HttpGet("ListarProducto")]
        public async Task<IActionResult> Listar()
        {
            var productos = await _productoServicio.ListarAsync();

            return Ok(ApiRespuesta<IEnumerable<ProductoListarDTO>>.CrearExito(
                "Productos obtenidos correctamente.",
                productos
            ));
        }

        [HttpGet("ObtenerProducto/{idProducto}")]
        public async Task<IActionResult> ObtenerPorId(int idProducto)
        {
            var producto = await _productoServicio.ObtenerPorIdAsync(idProducto);

            if (producto == null)
            {
                return NotFound(ApiRespuesta<object>.CrearError("Producto no encontrado."));
            }

            return Ok(ApiRespuesta<ProductoListarDTO>.CrearExito(
                "Producto obtenido correctamente.",
                producto
            ));
        }

        [HttpPost("InsertarProducto")]
        public async Task<IActionResult> Insertar([FromBody] ProductoCrearDTO productoCrearDTO)
        {
            var idProducto = await _productoServicio.InsertarAsync(productoCrearDTO);

            return CreatedAtAction(
                nameof(ObtenerPorId),
                new { idProducto },
                ApiRespuesta<object>.CrearExito(
                    "Producto insertado correctamente.",
                    new { idProducto }
                )
            );
        }

        [HttpPut("ActualizarProducto")]
        public async Task<IActionResult> Actualizar([FromBody] ProductoActualizarDTO productoActualizarDTO)
        {
            await _productoServicio.ActualizarAsync(productoActualizarDTO);

            return Ok(ApiRespuesta<object>.CrearExito(
                "Producto actualizado correctamente."
            ));
        }

        [HttpDelete("Desactivar/{idProducto}")]
        public async Task<IActionResult> Desactivar(int idProducto)
        {
            await _productoServicio.DesactivarAsync(idProducto);

            return Ok(ApiRespuesta<object>.CrearExito(
                "Producto desactivado correctamente."
            ));
        }
    }
}