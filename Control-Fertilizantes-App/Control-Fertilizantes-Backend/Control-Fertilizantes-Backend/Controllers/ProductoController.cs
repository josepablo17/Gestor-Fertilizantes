using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Interfaces;
using Microsoft.AspNetCore.Http;
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
            return Ok(productos);
        }

        [HttpGet("ObtenerProducto/{idProducto}")]
        public async Task<IActionResult> ObtenerPorId(int idProducto)
        {
            var producto = await _productoServicio.ObtenerPorIdAsync(idProducto);

            if (producto == null)
            {
                return NotFound(new { mensaje = "Producto no encontrado." });
            }

            return Ok(producto);
        }

        [HttpPost("InsertarProducto")]
        public async Task<IActionResult> Insertar([FromBody] ProductoCrearDTO productoCrearDTO)
        {
            var idProducto = await _productoServicio.InsertarAsync(productoCrearDTO);

            return Ok(new
            {
                mensaje = "Producto insertado correctamente.",
                idProducto = idProducto
            });
        }

        [HttpPut("ActualizarProducto")]
        public async Task<IActionResult> Actualizar([FromBody] ProductoActualizarDTO productoActualizarDTO)
        {
            var actualizado = await _productoServicio.ActualizarAsync(productoActualizarDTO);

            if (!actualizado)
            {
                return NotFound(new { mensaje = "No se pudo actualizar el producto porque no existe." });
            }

            return Ok(new { mensaje = "Producto actualizado correctamente." });
        }

        [HttpDelete("Desactivar/{idProducto}")]
        public async Task<IActionResult> Desactivar(int idProducto)
        {
            var desactivado = await _productoServicio.DesactivarAsync(idProducto);

            if (!desactivado)
            {
                return NotFound(new { mensaje = "No se pudo desactivar el producto porque no existe." });
            }

            return Ok(new { mensaje = "Producto desactivado correctamente." });
        }
    }
}
