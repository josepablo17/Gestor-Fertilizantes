using System.ComponentModel.DataAnnotations;
using Control_Fertilizantes_Backend.Comun.Errores;
using Control_Fertilizantes_Backend.Comun.Respuestas;
using Control_Fertilizantes_Backend.Modulos.Presupuestos.Contratos;
using Control_Fertilizantes_Backend.Modulos.Presupuestos.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Presupuestos.DTOs.Salidas;
using Microsoft.AspNetCore.Mvc;

namespace Control_Fertilizantes_Backend.Modulos.Presupuestos.Controladores;

[ApiController]
[Route("api/presupuestos")]
public sealed class PresupuestosController(IPresupuestoRepositorio repositorio) : ControllerBase
{
    [HttpGet]
    public async Task<ApiRespuesta<IReadOnlyList<PresupuestoResumenDTO>>> Listar(
        [FromQuery] int? idFinca, [FromQuery, RegularExpression("CRC|USD")] string? moneda,
        [FromQuery, RegularExpression("Borrador|Aprobado|Cerrado")] string? estado, CancellationToken ct) =>
        ApiRespuesta<IReadOnlyList<PresupuestoResumenDTO>>.CrearExito("Presupuestos consultados.",
            await repositorio.Listar(idFinca, moneda, estado, ct));

    [HttpGet("{id:long:min(1)}")]
    public async Task<ApiRespuesta<PresupuestoDetalleDTO>> Consultar(long id, CancellationToken ct) =>
        ApiRespuesta<PresupuestoDetalleDTO>.CrearExito("Presupuesto consultado.", await repositorio.Consultar(id, ct));

    [HttpGet("catalogos")]
    public async Task<ApiRespuesta<CatalogosPresupuestoDTO>> Catalogos(CancellationToken ct) =>
        ApiRespuesta<CatalogosPresupuestoDTO>.CrearExito("Catálogos consultados.", await repositorio.Catalogos(ct));

    [HttpPost("fincas")]
    public async Task<ApiRespuesta<int>> CrearFinca(CatalogoPresupuestoDTO datos, CancellationToken ct) =>
        ApiRespuesta<int>.CrearExito("Finca registrada.", await repositorio.CrearFinca(datos, ct));

    [HttpPost("rubros")]
    public async Task<ApiRespuesta<int>> CrearRubro(CatalogoPresupuestoDTO datos, CancellationToken ct) =>
        ApiRespuesta<int>.CrearExito("Rubro registrado.", await repositorio.CrearRubro(datos, ct));

    [HttpPost]
    public async Task<IActionResult> Crear(CrearPresupuestoDTO datos, CancellationToken ct)
    {
        if (datos.FechaInicio == default || datos.FechaFin == default)
            throw new ReglaNegocio("Indique las fechas de inicio y fin del presupuesto.");
        var id = await repositorio.Crear(datos, ct);
        return CreatedAtAction(nameof(Consultar), new { id }, ApiRespuesta<long>.CrearExito("Presupuesto creado.", id));
    }

    [HttpPost("{id:long:min(1)}/aprobar")]
    public async Task<ApiRespuesta<object>> Aprobar(long id, OperacionPresupuestoDTO datos, CancellationToken ct)
    {
        await repositorio.Aprobar(id, datos, ct);
        return ApiRespuesta<object>.CrearExito("Presupuesto aprobado.");
    }

    [HttpPost("{id:long:min(1)}/cerrar")]
    public async Task<ApiRespuesta<object>> Cerrar(long id, OperacionPresupuestoDTO datos, CancellationToken ct)
    {
        await repositorio.Cerrar(id, datos, ct);
        return ApiRespuesta<object>.CrearExito("Presupuesto cerrado.");
    }

    [HttpPost("partidas/{id:long:min(1)}/ajustes")]
    public async Task<ApiRespuesta<object>> Ajustar(long id, AjustarPartidaDTO datos, CancellationToken ct)
    {
        if (datos.Ajuste is 0 or > 99999999999999.9999m or < -99999999999999.9999m
            || decimal.Round(datos.Ajuste, 4) != datos.Ajuste)
            throw new ReglaNegocio("Indique un ajuste distinto de cero con un máximo de cuatro decimales.");

        await repositorio.Ajustar(id, datos, ct);
        return ApiRespuesta<object>.CrearExito("Partida ajustada.");
    }

    [HttpPost("compromisos")]
    public async Task<ApiRespuesta<long>> RegistrarCompromiso(RegistrarCompromisoDTO datos, CancellationToken ct)
    {
        if (datos.FechaCompromiso == default || datos.IdSolicitudCotizacion is <= 0)
            throw new ReglaNegocio("Indique la fecha del compromiso y una solicitud válida si corresponde.");

        return ApiRespuesta<long>.CrearExito("Compromiso registrado.", await repositorio.RegistrarCompromiso(datos, ct));
    }

    [HttpPost("compromisos/{id:long:min(1)}/finalizar")]
    public async Task<ApiRespuesta<object>> FinalizarCompromiso(long id, FinalizarCompromisoDTO datos, CancellationToken ct)
    {
        await repositorio.FinalizarCompromiso(id, datos, ct);
        return ApiRespuesta<object>.CrearExito("Compromiso finalizado.");
    }

    [HttpGet("opciones")]
    public async Task<ApiRespuesta<OpcionesImputacionDTO>> Opciones([FromQuery] DateOnly fecha,
        [FromQuery, Required, RegularExpression("CRC|USD")] string moneda, [FromQuery] int? idProducto,
        [FromQuery] int? idPresentacionProducto, [FromQuery] int? idProveedor, CancellationToken ct)
    {
        if (fecha == default || idProducto is <= 0 || idPresentacionProducto is <= 0 || idProveedor is <= 0)
            throw new ReglaNegocio("Indique una fecha válida y los identificadores aplicables a la compra.");

        return ApiRespuesta<OpcionesImputacionDTO>.CrearExito("Partidas y compromisos consultados.",
            await repositorio.Opciones(fecha, moneda, idProducto, idPresentacionProducto, idProveedor, ct));
    }

    [HttpGet("compras/{id:long:min(1)}")]
    public async Task<ApiRespuesta<IReadOnlyList<ImputacionActivaDTO>>> ConsultarCompra(long id, CancellationToken ct) =>
        ApiRespuesta<IReadOnlyList<ImputacionActivaDTO>>.CrearExito("Distribución consultada.",
            await repositorio.ConsultarCompra(id, ct));

    [HttpPost("compras/{id:long:min(1)}/imputar")]
    public async Task<ApiRespuesta<object>> ImputarCompra(long id, ImputacionCompraDTO datos, CancellationToken ct)
    {
        await repositorio.ImputarCompra(id, datos, ct);
        return ApiRespuesta<object>.CrearExito("Compra imputada.");
    }

    [HttpPost("compras/{id:long:min(1)}/revertir")]
    public async Task<ApiRespuesta<object>> RevertirCompra(long id, OperacionPresupuestoDTO datos, CancellationToken ct)
    {
        await repositorio.RevertirCompra(id, datos, ct);
        return ApiRespuesta<object>.CrearExito("Imputación revertida.");
    }
}
