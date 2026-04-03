using Control_Fertilizantes_Backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Control_Fertilizantes_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompraInteligenciaController : ControllerBase
    {
        private readonly ICompraInteligenciaServicio _compraInteligenciaServicio;

        public CompraInteligenciaController(ICompraInteligenciaServicio compraInteligenciaServicio)
        {
            _compraInteligenciaServicio = compraInteligenciaServicio;
        }

        [HttpGet("HistorialPrecios")]
        public async Task<IActionResult> ObtenerHistorialPrecios([FromQuery] int idProducto, [FromQuery] int idPresentacionProducto)
        {
            var historial = await _compraInteligenciaServicio.ObtenerHistorialPreciosPorProductoAsync(idProducto, idPresentacionProducto);

            return Ok(historial);
        }

        [HttpGet("ResumenInteligentePrecios")]
        public async Task<IActionResult> ObtenerResumenInteligentePrecios([FromQuery] int idProducto, [FromQuery] int idPresentacionProducto)
        {
            var resumen = await _compraInteligenciaServicio.ObtenerResumenInteligentePreciosAsync(idProducto, idPresentacionProducto);

            if (resumen == null)
            {
                return NotFound(new { mensaje = "No se encontró información de compras para el producto y presentación indicados." });
            }

            return Ok(resumen);
        }

        [HttpGet("EvaluarCompra/{idCompra}")]
        public async Task<IActionResult> EvaluarCompra(int idCompra)
        {
            var evaluacion = await _compraInteligenciaServicio.EvaluarCompraAsync(idCompra);

            if (evaluacion == null)
            {
                return NotFound(new { mensaje = "No se encontró información para evaluar la compra indicada." });
            }

            return Ok(evaluacion);
        }

        [HttpGet("Alertas")]
        public async Task<IActionResult> ObtenerAlertas([FromQuery] int idProducto, [FromQuery] int idPresentacionProducto)
        {
            var alertas = await _compraInteligenciaServicio.ObtenerAlertasPorProductoAsync(idProducto, idPresentacionProducto);

            return Ok(alertas);
        }
    }
}