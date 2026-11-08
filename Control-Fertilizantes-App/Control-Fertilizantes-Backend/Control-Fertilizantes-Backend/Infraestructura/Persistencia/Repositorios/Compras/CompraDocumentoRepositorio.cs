using System.Data;
using System.Text.Json;
using Control_Fertilizantes_Backend.Modulos.Compras.Contratos;
using Control_Fertilizantes_Backend.Modulos.Compras.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Compras.DTOs.Salidas;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Presupuestos;
using Dapper;
using Microsoft.Data.SqlClient;

namespace Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Compras;

public sealed class CompraDocumentoRepositorio(IConexionBD fabrica) : ICompraDocumentoRepositorio
{
    private async Task<T> Ejecutar<T>(Func<IDbConnection, Task<T>> accion)
    {
        using var conexion = fabrica.ObtenerConexion();
        try { return await accion(conexion); }
        catch (SqlException e) when (ErroresPresupuestoSql.EsErrorConocido(e)) { throw ErroresPresupuestoSql.Traducir(e); }
    }

    private static CommandDefinition Comando(string nombre, object parametros, CancellationToken ct) =>
        new(nombre, parametros, commandType: CommandType.StoredProcedure, cancellationToken: ct);

    public Task<ComprasDocumentoPaginaDTO> Listar(string? busqueda, string? moneda, DateOnly? fecha, int pagina, int tamanoPagina, CancellationToken ct) =>
        Ejecutar(async c =>
        {
            using var filas = await c.QueryMultipleAsync(Comando("dbo.usp_Compra_ListarDocumentos", new
            { Busqueda = busqueda, Moneda = moneda, Fecha = fecha?.ToDateTime(TimeOnly.MinValue), Pagina = pagina, TamanoPagina = tamanoPagina }, ct));
            return new ComprasDocumentoPaginaDTO(await filas.ReadSingleAsync<long>(), (await filas.ReadAsync<CompraDocumentoResumenDTO>()).AsList());
        });

    public Task<CompraDocumentoDTO> Obtener(long id, CancellationToken ct) => Ejecutar(async c =>
    {
        using var filas = await c.QueryMultipleAsync(Comando("dbo.usp_Compra_ObtenerDocumento", new { IdCompraCabecera = id }, ct));
        var compra = await filas.ReadSingleAsync<CompraDocumentoDTO>();
        compra.Lineas = (await filas.ReadAsync<CompraRenglonDTO>()).AsList();
        return compra;
    });

    public Task<long> Registrar(CompraDocumentoCrearDTO d, CancellationToken ct) => Ejecutar(c =>
        c.ExecuteScalarAsync<long>(Comando("dbo.usp_Compra_RegistrarDocumento", new
        { d.IdProveedor, FechaCompra = d.FechaCompra.ToDateTime(TimeOnly.MinValue), d.Moneda, d.NumeroFactura, d.Observaciones,
          d.IdOperacion, LineasJson = JsonSerializer.Serialize(d.Lineas, JsonSerializerOptions.Web) }, ct)));

    public async Task ActualizarCabecera(long id, CompraCabeceraActualizarDTO d, CancellationToken ct) =>
        await Ejecutar(c => c.ExecuteAsync(Comando("dbo.usp_Compra_ActualizarCabecera", new
        { IdCompraCabecera = id, d.Version, d.IdProveedor, FechaCompra = d.FechaCompra.ToDateTime(TimeOnly.MinValue), d.Moneda, d.NumeroFactura, d.Observaciones }, ct)));

    public async Task ActualizarRenglon(long id, long idCompra, CompraRenglonActualizarDTO d, CancellationToken ct) =>
        await Ejecutar(c => c.ExecuteAsync(Comando("dbo.usp_Compra_ActualizarRenglon", new
        { IdCompraCabecera = id, IdCompra = idCompra, d.Version, d.IdProducto, d.IdPresentacionProducto, d.CantidadComprada, d.PrecioTotal, d.Observaciones }, ct)));
}
