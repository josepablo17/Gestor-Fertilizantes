using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Control_Fertilizantes_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UnidadMedidaController : ControllerBase
    {
        private readonly IUnidadMedidaServicio _unidadMedidaServicio;

        public UnidadMedidaController(IUnidadMedidaServicio unidadMedidaServicio)
        {
            _unidadMedidaServicio = unidadMedidaServicio;
        }

        [HttpGet("ListarUnidadMedida")]
        public async Task<IActionResult> Listar()
        {
            var unidadesMedida = await _unidadMedidaServicio.ListarAsync();

            return Ok(ApiRespuesta<IEnumerable<UnidadMedidaListarDTO>>.CrearExito(
                "Unidades de medida obtenidas correctamente.",
                unidadesMedida
            ));
        }

        [HttpGet("ObtenerUnidadMedida/{idUnidadMedida}")]
        public async Task<IActionResult> ObtenerPorId(int idUnidadMedida)
        {
            var unidadMedida = await _unidadMedidaServicio.ObtenerPorIdAsync(idUnidadMedida);

            if (unidadMedida == null)
            {
                return NotFound(ApiRespuesta<object>.CrearError("Unidad de medida no encontrada."));
            }

            return Ok(ApiRespuesta<UnidadMedidaListarDTO>.CrearExito(
                "Unidad de medida obtenida correctamente.",
                unidadMedida
            ));
        }

        [HttpPost("InsertarUnidadMedida")]
        public async Task<IActionResult> Insertar([FromBody] UnidadMedidaCrearDTO unidadMedidaCrearDTO)
        {
            var idUnidadMedida = await _unidadMedidaServicio.InsertarAsync(unidadMedidaCrearDTO);

            return CreatedAtAction(
                nameof(ObtenerPorId),
                new { idUnidadMedida },
                ApiRespuesta<object>.CrearExito(
                    "Unidad de medida insertada correctamente.",
                    new { idUnidadMedida }
                )
            );
        }

        [HttpPut("ActualizarUnidadMedida")]
        public async Task<IActionResult> Actualizar([FromBody] UnidadMedidaActualizarDTO unidadMedidaActualizarDTO)
        {
            await _unidadMedidaServicio.ActualizarAsync(unidadMedidaActualizarDTO);

            return Ok(ApiRespuesta<object>.CrearExito(
                "Unidad de medida actualizada correctamente."
            ));
        }

        [HttpDelete("Desactivar/{idUnidadMedida}")]
        public async Task<IActionResult> Desactivar(int idUnidadMedida)
        {
            await _unidadMedidaServicio.DesactivarAsync(idUnidadMedida);

            return Ok(ApiRespuesta<object>.CrearExito(
                "Unidad de medida desactivada correctamente."
            ));
        }
    }
}