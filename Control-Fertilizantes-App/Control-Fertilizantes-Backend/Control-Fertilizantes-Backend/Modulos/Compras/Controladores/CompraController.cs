using System.ComponentModel.DataAnnotations;
using Control_Fertilizantes_Backend.Comun.Respuestas;
using Control_Fertilizantes_Backend.Modulos.Compras.Contratos;
using Control_Fertilizantes_Backend.Modulos.Compras.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Compras.DTOs.Salidas;
using Microsoft.AspNetCore.Mvc;

namespace Control_Fertilizantes_Backend.Modulos.Compras.Controladores
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompraController : ControllerBase
    {
        private readonly ICompraServicio _compraServicio;

        public CompraController(ICompraServicio compraServicio)
        {
            _compraServicio = compraServicio;
        }

        [HttpGet("ListarCompra")]
        public async Task<IActionResult> Listar()
        {
            var compras = await _compraServicio.ListarAsync();

            return Ok(ApiRespuesta<IEnumerable<CompraListarDTO>>.CrearExito(
                "Compras obtenidas correctamente.",
                compras
            ));
        }

        [HttpGet("ObtenerCompra/{idCompra}")]
        public async Task<IActionResult> ObtenerPorId(int idCompra)
        {
            var compra = await _compraServicio.ObtenerPorIdAsync(idCompra);

            if (compra == null)
            {
                return NotFound(ApiRespuesta<object>.CrearError("Compra no encontrada."));
            }

            return Ok(ApiRespuesta<CompraDetalleDTO>.CrearExito(
                "Compra obtenida correctamente.",
                compra
            ));
        }

        [HttpPost("InsertarCompra")]
        public async Task<IActionResult> Insertar([FromBody] CompraCrearDTO compraCrearDTO)
        {
            var idCompra = await _compraServicio.InsertarAsync(compraCrearDTO);

            return CreatedAtAction(
                nameof(ObtenerPorId),
                new { idCompra },
                ApiRespuesta<object>.CrearExito(
                    "Compra insertada correctamente.",
                    new { idCompra }
                )
            );
        }

        [HttpPut("ActualizarCompra")]
        public async Task<IActionResult> Actualizar([FromBody] CompraActualizarDTO compraActualizarDTO)
        {
            await _compraServicio.ActualizarAsync(compraActualizarDTO);

            return Ok(ApiRespuesta<object>.CrearExito(
                "Compra actualizada correctamente."
            ));
        }

        [HttpGet("HistorialPorProducto/{idProducto}")]
        public async Task<IActionResult> HistorialPorProducto(int idProducto)
        {
            var historial = await _compraServicio.HistorialPorProductoAsync(idProducto);

            return Ok(ApiRespuesta<IEnumerable<CompraListarDTO>>.CrearExito(
                "Historial de compras obtenido correctamente.",
                historial
            ));
        }

        [HttpGet("ObtenerUltimoPrecio")]
        public async Task<IActionResult> ObtenerUltimoPrecio([FromQuery] int idProducto, [FromQuery] int idPresentacionProducto,
            [FromQuery, Required] string? moneda, [FromQuery] DateOnly? fechaLimite,
            [FromQuery] int? idCompraLimite, CancellationToken cancelacion)
        {
            var ultimoPrecio = await _compraServicio.ObtenerUltimoPrecioAsync(idProducto, idPresentacionProducto,
                moneda, fechaLimite, idCompraLimite, cancelacion);

            if (ultimoPrecio == null)
            {
                return NotFound(ApiRespuesta<object>.CrearError(
                    "No se encontraron compras anteriores para la presentación, moneda y fecha indicadas."
                ));
            }

            return Ok(ApiRespuesta<UltimoPrecioCompraDTO>.CrearExito(
                "Último precio obtenido correctamente.",
                ultimoPrecio
            ));
        }
    }
}
