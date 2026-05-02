using Control_Fertilizantes_Backend.DTOs;
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

            return Ok(ApiRespuesta<object>.CrearExito(
                "Historial de precios obtenido correctamente.",
                historial
            ));
        }

        [HttpGet("ResumenInteligentePrecios")]
        public async Task<IActionResult> ObtenerResumenInteligentePrecios([FromQuery] int idProducto, [FromQuery] int idPresentacionProducto)
        {
            var resumen = await _compraInteligenciaServicio.ObtenerResumenInteligentePreciosAsync(idProducto, idPresentacionProducto);

            if (resumen == null)
            {
                return NotFound(ApiRespuesta<object>.CrearError(
                    "No se encontró información de compras para el producto y presentación indicados."
                ));
            }

            return Ok(ApiRespuesta<object>.CrearExito(
                "Resumen inteligente de precios obtenido correctamente.",
                resumen
            ));
        }

        [HttpGet("EvaluarCompra/{idCompra}")]
        public async Task<IActionResult> EvaluarCompra(int idCompra)
        {
            var evaluacion = await _compraInteligenciaServicio.EvaluarCompraAsync(idCompra);

            if (evaluacion == null)
            {
                return NotFound(ApiRespuesta<object>.CrearError(
                    "No se encontró información para evaluar la compra indicada."
                ));
            }

            return Ok(ApiRespuesta<object>.CrearExito(
                "Evaluación de compra obtenida correctamente.",
                evaluacion
            ));
        }

        [HttpGet("Alertas")]
        public async Task<IActionResult> ObtenerAlertas([FromQuery] int idProducto, [FromQuery] int idPresentacionProducto)
        {
            var alertas = await _compraInteligenciaServicio.ObtenerAlertasPorProductoAsync(idProducto, idPresentacionProducto);

            return Ok(ApiRespuesta<object>.CrearExito(
                "Alertas obtenidas correctamente.",
                alertas
            ));
        }
    }
}