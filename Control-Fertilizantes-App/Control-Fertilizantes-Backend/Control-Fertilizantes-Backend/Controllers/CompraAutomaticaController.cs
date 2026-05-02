using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Control_Fertilizantes_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompraAutomaticaController : ControllerBase
    {
        private readonly ICompraAutomaticaServicio _compraAutomaticaServicio;
        private readonly IProformaPdfServicio _procesadorProformaPdfServicio;

        public CompraAutomaticaController(
            ICompraAutomaticaServicio compraAutomaticaServicio,
            IProformaPdfServicio procesadorProformaPdfServicio)
        {
            _compraAutomaticaServicio = compraAutomaticaServicio;
            _procesadorProformaPdfServicio = procesadorProformaPdfServicio;
        }

        [HttpPost("VistaPreviaValidada")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> VistaPreviaValidada([FromForm] VistaPreviaValidadaRequestDTO dto)
        {
            if (dto.ArchivoPdf == null || dto.ArchivoPdf.Length == 0)
            {
                return BadRequest(new
                {
                    Exito = false,
                    Mensaje = "Debe adjuntar un archivo PDF válido."
                });
            }

            var vistaPreviaPdf = await _procesadorProformaPdfServicio.ProcesarProformaPdfAsync(dto.ArchivoPdf);
            var resultado = await _compraAutomaticaServicio.ValidarVistaPreviaAsync(vistaPreviaPdf);

            return Ok(new
            {
                Exito = true,
                Mensaje = "Vista previa validada generada correctamente.",
                Data = resultado
            });
        }

        [HttpPost("ConfirmarCompras")]
        public async Task<IActionResult> ConfirmarCompras([FromBody] ConfirmarComprasAutomaticasDTO dto)
        {
            if (dto == null)
            {
                return BadRequest(new
                {
                    Exito = false,
                    Mensaje = "La información de confirmación es obligatoria."
                });
            }

            var comprasGeneradas = await _compraAutomaticaServicio.ConfirmarComprasAutomaticasAsync(dto);

            return Ok(new
            {
                Exito = true,
                Mensaje = "Las compras automáticas se registraron correctamente.",
                Data = comprasGeneradas
            });
        }
    }
}