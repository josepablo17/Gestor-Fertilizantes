using Control_Fertilizantes_Backend.Comun.Respuestas;
using Control_Fertilizantes_Backend.Modulos.Proformas.Contratos;
using Control_Fertilizantes_Backend.Modulos.Proformas.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Proformas.DTOs.Salidas;
using Microsoft.AspNetCore.Mvc;

namespace Control_Fertilizantes_Backend.Modulos.Proformas.Controladores
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProformaProveedorController : ControllerBase
    {
        private readonly IProformaProveedorServicio _proformaProveedorServicio;

        public ProformaProveedorController(IProformaProveedorServicio proformaProveedorServicio)
        {
            _proformaProveedorServicio = proformaProveedorServicio;
        }

        [HttpGet("ListarProformasProveedor")]
        public async Task<IActionResult> Listar()
        {
            var proformas = await _proformaProveedorServicio.ListarAsync();

            return Ok(ApiRespuesta<IEnumerable<ProformaProveedorRespuestaDTO>>.CrearExito(
                "Proformas obtenidas correctamente.",
                proformas
            ));
        }

        [HttpGet("ObtenerProformaProveedor/{idProformaProveedor}")]
        public async Task<IActionResult> ObtenerPorId(int idProformaProveedor)
        {
            var proforma = await _proformaProveedorServicio.ObtenerPorIdAsync(idProformaProveedor);

            if (proforma == null)
            {
                return NotFound(ApiRespuesta<object>.CrearError("Proforma no encontrada."));
            }

            return Ok(ApiRespuesta<ProformaProveedorRespuestaDTO>.CrearExito(
                "Proforma obtenida correctamente.",
                proforma
            ));
        }

        [HttpPost("GuardarProformaProveedor")]
        public async Task<IActionResult> Guardar([FromBody] GuardarProformaProveedorDTO guardarProformaProveedorDTO)
        {
            var proformaGuardada = await _proformaProveedorServicio.GuardarAsync(guardarProformaProveedorDTO);

            return CreatedAtAction(
                nameof(ObtenerPorId),
                new { idProformaProveedor = proformaGuardada.IdProformaProveedor },
                ApiRespuesta<ProformaProveedorRespuestaDTO>.CrearExito(
                    "Proforma guardada correctamente.",
                    proformaGuardada
                )
            );
        }
    }
}