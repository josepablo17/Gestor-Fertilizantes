using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Control_Fertilizantes_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PresentacionProductoController : ControllerBase
    {
        private readonly IPresentacionProductoServicio _presentacionProductoServicio;

        public PresentacionProductoController(IPresentacionProductoServicio presentacionProductoServicio)
        {
            _presentacionProductoServicio = presentacionProductoServicio;
        }

        [HttpGet("ListarPresentacionesProducto")]
        public async Task<IActionResult> Listar()
        {
            var presentaciones = await _presentacionProductoServicio.ListarAsync();

            return Ok(ApiRespuesta<IEnumerable<PresentacionProductoListarDTO>>.CrearExito(
                "Presentaciones del producto obtenidas correctamente.",
                presentaciones
            ));
        }

        [HttpGet("ObtenerPresentacionProducto/{idPresentacionProducto}")]
        public async Task<IActionResult> ObtenerPorId(int idPresentacionProducto)
        {
            var presentacion = await _presentacionProductoServicio.ObtenerPorIdAsync(idPresentacionProducto);

            if (presentacion == null)
            {
                return NotFound(ApiRespuesta<object>.CrearError("Presentación del producto no encontrada."));
            }

            return Ok(ApiRespuesta<PresentacionProductoListarDTO>.CrearExito(
                "Presentación del producto obtenida correctamente.",
                presentacion
            ));
        }

        [HttpPost("InsertarPresentacionProducto")]
        public async Task<IActionResult> Insertar([FromBody] PresentacionProductoCrearDTO presentacionProductoCrearDTO)
        {
            var idPresentacionProducto = await _presentacionProductoServicio.InsertarAsync(presentacionProductoCrearDTO);

            return CreatedAtAction(
                nameof(ObtenerPorId),
                new { idPresentacionProducto },
                ApiRespuesta<object>.CrearExito(
                    "Presentación del producto insertada correctamente.",
                    new { idPresentacionProducto }
                )
            );
        }

        [HttpPut("ActualizarPresentacionProducto")]
        public async Task<IActionResult> Actualizar([FromBody] PresentacionProductoActualizarDTO presentacionProductoActualizarDTO)
        {
            await _presentacionProductoServicio.ActualizarAsync(presentacionProductoActualizarDTO);

            return Ok(ApiRespuesta<object>.CrearExito(
                "Presentación del producto actualizada correctamente."
            ));
        }

        [HttpDelete("Desactivar/{idPresentacionProducto}")]
        public async Task<IActionResult> Desactivar(int idPresentacionProducto)
        {
            await _presentacionProductoServicio.DesactivarAsync(idPresentacionProducto);

            return Ok(ApiRespuesta<object>.CrearExito(
                "Presentación del producto desactivada correctamente."
            ));
        }

        [HttpGet("ListarProductosDropdown")]
        public async Task<IActionResult> ListarProductosDropdown()
        {
            var productos = await _presentacionProductoServicio.ListarProductosParaDropdownAsync();

            return Ok(ApiRespuesta<IEnumerable<ProductoDropdownDTO>>.CrearExito(
                "Productos para dropdown obtenidos correctamente.",
                productos
            ));
        }

        [HttpGet("ListarUnidadesMedidaDropdown")]
        public async Task<IActionResult> ListarUnidadesMedidaDropdown()
        {
            var unidades = await _presentacionProductoServicio.ListarUnidadesMedidaParaDropdownAsync();

            return Ok(ApiRespuesta<IEnumerable<UnidadMedidaDropdownDTO>>.CrearExito(
                "Unidades de medida para dropdown obtenidas correctamente.",
                unidades
            ));
        }
    }
}