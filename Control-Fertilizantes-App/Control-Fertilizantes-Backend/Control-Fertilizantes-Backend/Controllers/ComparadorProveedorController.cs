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
            int idProducto,
            int idPresentacionProducto,
            string? moneda = null,
            int? mesesAnalisis = null,
            bool soloAutorizados = false)
        {
            var resultado = await _comparadorProveedorServicio.ObtenerComparativaAsync(
                idProducto,
                idPresentacionProducto,
                moneda,
                mesesAnalisis,
                soloAutorizados
            );

            return Ok(resultado);
        }

        [HttpGet("DetalleProveedor")]
        public async Task<IActionResult> ObtenerDetalleProveedor(
            int idProducto,
            int idPresentacionProducto,
            int idProveedor,
            string? moneda = null,
            int? mesesAnalisis = null)
        {
            var resultado = await _comparadorProveedorServicio.ObtenerDetalleProveedorAsync(
                idProducto,
                idPresentacionProducto,
                idProveedor,
                moneda,
                mesesAnalisis
            );

            if (resultado == null)
                return NotFound(new { mensaje = "No se encontró información del proveedor para los filtros seleccionados." });

            return Ok(resultado);
        }
    }
}