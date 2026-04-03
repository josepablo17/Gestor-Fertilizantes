using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Control_Fertilizantes_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProveedorController : ControllerBase
    {
        private readonly IProveedorServicio _proveedorServicio;

        public ProveedorController(IProveedorServicio proveedorServicio)
        {
            _proveedorServicio = proveedorServicio;
        }

        [HttpGet("ListarProveedor")]
        public async Task<IActionResult> Listar()
        {
            var proveedores = await _proveedorServicio.ListarAsync();

            return Ok(ApiRespuesta<IEnumerable<ProveedorListarDTO>>.CrearExito(
                "Proveedores obtenidos correctamente.",
                proveedores
            ));
        }

        [HttpGet("ObtenerProveedor/{idProveedor}")]
        public async Task<IActionResult> ObtenerPorId(int idProveedor)
        {
            var proveedor = await _proveedorServicio.ObtenerPorIdAsync(idProveedor);

            if (proveedor == null)
            {
                return NotFound(ApiRespuesta<object>.CrearError("Proveedor no encontrado."));
            }

            return Ok(ApiRespuesta<ProveedorListarDTO>.CrearExito(
                "Proveedor obtenido correctamente.",
                proveedor
            ));
        }

        [HttpPost("InsertarProveedor")]
        public async Task<IActionResult> Insertar([FromBody] ProveedorCrearDTO proveedorCrearDTO)
        {
            var idProveedor = await _proveedorServicio.InsertarAsync(proveedorCrearDTO);

            return CreatedAtAction(
                nameof(ObtenerPorId),
                new { idProveedor },
                ApiRespuesta<object>.CrearExito(
                    "Proveedor insertado correctamente.",
                    new { idProveedor }
                )
            );
        }

        [HttpPut("ActualizarProveedor")]
        public async Task<IActionResult> Actualizar([FromBody] ProveedorActualizarDTO proveedorActualizarDTO)
        {
            await _proveedorServicio.ActualizarAsync(proveedorActualizarDTO);

            return Ok(ApiRespuesta<object>.CrearExito(
                "Proveedor actualizado correctamente."
            ));
        }

        [HttpDelete("Desactivar/{idProveedor}")]
        public async Task<IActionResult> Desactivar(int idProveedor)
        {
            await _proveedorServicio.DesactivarAsync(idProveedor);

            return Ok(ApiRespuesta<object>.CrearExito(
                "Proveedor desactivado correctamente."
            ));
        }
    }
}