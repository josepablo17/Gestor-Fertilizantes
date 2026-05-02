using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Control_Fertilizantes_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComparadorProveedorController : ControllerBase
    {
        private readonly IComparadorProveedorServicio _comparadorProveedorServicio;

        public ComparadorProveedorController(IComparadorProveedorServicio comparadorProveedorServicio)
        {
            _comparadorProveedorServicio = comparadorProveedorServicio;
        }

        [HttpGet("Comparar")]
        public async Task<IActionResult> ObtenerComparativa(
            [FromQuery] int idProducto,
            [FromQuery] int idPresentacionProducto,
            [FromQuery] string? moneda = null,
            [FromQuery] int? mesesAnalisis = null,
            [FromQuery] bool soloAutorizados = false)
        {
            var resultado = await _comparadorProveedorServicio.ObtenerComparativaAsync(
                idProducto,
                idPresentacionProducto,
                moneda,
                mesesAnalisis,
                soloAutorizados
            );

            return Ok(ApiRespuesta<object>.CrearExito(
                "Comparativa de proveedores obtenida correctamente.",
                resultado
            ));
        }

        [HttpGet("DetalleProveedor")]
        public async Task<IActionResult> ObtenerDetalleProveedor(
            [FromQuery] int idProducto,
            [FromQuery] int idPresentacionProducto,
            [FromQuery] int idProveedor,
            [FromQuery] string? moneda = null,
            [FromQuery] int? mesesAnalisis = null)
        {
            var resultado = await _comparadorProveedorServicio.ObtenerDetalleProveedorAsync(
                idProducto,
                idPresentacionProducto,
                idProveedor,
                moneda,
                mesesAnalisis
            );

            if (resultado == null)
            {
                return NotFound(ApiRespuesta<object>.CrearError(
                    "No se encontró información del proveedor para los filtros seleccionados."
                ));
            }

            return Ok(ApiRespuesta<object>.CrearExito(
                "Detalle del proveedor obtenido correctamente.",
                resultado
            ));
        }
    }
}