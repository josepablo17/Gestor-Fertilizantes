using System.ComponentModel.DataAnnotations;
using Control_Fertilizantes_Backend.Comun.Respuestas;
using Control_Fertilizantes_Backend.Comun.Validacion;
using Control_Fertilizantes_Backend.Modulos.Compras.Contratos;
using Control_Fertilizantes_Backend.Modulos.Compras.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Compras.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Compras.Servicios;
using Microsoft.AspNetCore.Mvc;

namespace Control_Fertilizantes_Backend.Modulos.Compras.Controladores;

[ApiController]
[Route("api/compras-documento")]
public sealed class ComprasDocumentoController(ICompraDocumentoRepositorio repositorio, CompraDocumentoServicio servicio) : ControllerBase
{
    [HttpGet]
    public async Task<ApiRespuesta<ComprasDocumentoPaginaDTO>> Listar(
        [FromQuery, StringLength(150)] string? busqueda, [FromQuery, RegularExpression("CRC|USD")] string? moneda,
        [FromQuery] DateOnly? fecha, [FromQuery, Range(1, int.MaxValue)] int pagina = 1,
        [FromQuery, Range(1, 100)] int tamanoPagina = 20, CancellationToken ct = default) =>
        ApiRespuesta<ComprasDocumentoPaginaDTO>.CrearExito("Compras consultadas.",
            await repositorio.Listar(ValidacionCatalogo.Opcional(busqueda), moneda, fecha, pagina, tamanoPagina, ct));

    [HttpGet("{id:long:min(1)}")]
    public async Task<ApiRespuesta<CompraDocumentoDTO>> Obtener(long id, CancellationToken ct) =>
        ApiRespuesta<CompraDocumentoDTO>.CrearExito("Compra consultada.", await repositorio.Obtener(id, ct));

    [HttpPost]
    public async Task<IActionResult> Registrar(CompraDocumentoCrearDTO datos, CancellationToken ct)
    {
        var compra = await servicio.Registrar(datos, ct);
        return CreatedAtAction(nameof(Obtener), new { id = compra.IdCompraCabecera },
            ApiRespuesta<CompraDocumentoDTO>.CrearExito("Compra registrada.", compra));
    }

    [HttpPut("{id:long:min(1)}/cabecera")]
    public async Task<ApiRespuesta<CompraDocumentoDTO>> ActualizarCabecera(long id, CompraCabeceraActualizarDTO datos, CancellationToken ct) =>
        ApiRespuesta<CompraDocumentoDTO>.CrearExito("Cabecera actualizada.", await servicio.ActualizarCabecera(id, datos, ct));

    [HttpPut("{id:long:min(1)}/renglones/{idCompra:long:min(1)}")]
    public async Task<ApiRespuesta<CompraDocumentoDTO>> ActualizarRenglon(long id, long idCompra, CompraRenglonActualizarDTO datos, CancellationToken ct) =>
        ApiRespuesta<CompraDocumentoDTO>.CrearExito("Renglón actualizado.", await servicio.ActualizarRenglon(id, idCompra, datos, ct));
}
