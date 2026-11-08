using System.Data;
using System.Text.Json;
using Control_Fertilizantes_Backend.Modulos.Presupuestos.Contratos;
using Control_Fertilizantes_Backend.Modulos.Presupuestos.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Presupuestos.DTOs.Salidas;
using Dapper;
using Microsoft.Data.SqlClient;

namespace Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Presupuestos;

public sealed class PresupuestoRepositorio(IConexionBD conexionBD) : IPresupuestoRepositorio
{
    public Task<IReadOnlyList<PresupuestoResumenDTO>> Listar(int? idFinca, string? moneda, string? estado, CancellationToken ct) =>
        ListarFilas<PresupuestoResumenDTO>("usp_Presupuesto_Listar", new { idFinca, moneda, estado }, ct);

    public Task<PresupuestoDetalleDTO> Consultar(long id, CancellationToken ct) =>
        ConsultarVarias("usp_Presupuesto_Consultar", new { IdPresupuesto = id }, async filas =>
        {
            var cabecera = await filas.ReadSingleAsync<PresupuestoCabeceraDTO>();
            var partidas = (await filas.ReadAsync<PartidaPresupuestoDTO>()).AsList();
            var movimientos = (await filas.ReadAsync<MovimientoPresupuestoDTO>())
                .Select(movimiento => movimiento with { FechaRegistro = DateTime.SpecifyKind(movimiento.FechaRegistro, DateTimeKind.Utc) })
                .ToArray();
            var compromisos = (await filas.ReadAsync<CompromisoPresupuestoDTO>()).AsList();

            return new PresupuestoDetalleDTO(cabecera with
            {
                FechaCreacion = DateTime.SpecifyKind(cabecera.FechaCreacion, DateTimeKind.Utc),
                FechaAprobacion = ComoUtc(cabecera.FechaAprobacion),
                FechaCierre = ComoUtc(cabecera.FechaCierre)
            }, partidas, movimientos, compromisos);
        }, ct);

    public Task<CatalogosPresupuestoDTO> Catalogos(CancellationToken ct) =>
        ConsultarVarias("usp_Presupuesto_ListarCatalogos", null, async filas => new CatalogosPresupuestoDTO(
            (await filas.ReadAsync<FincaPresupuestoDTO>()).AsList(),
            (await filas.ReadAsync<RubroPresupuestoDTO>()).AsList()), ct);

    public Task<int> CrearFinca(CatalogoPresupuestoDTO datos, CancellationToken ct) =>
        GuardarConId<int>("usp_Finca_Guardar", datos, "IdFinca", DbType.Int32, ct);

    public Task<int> CrearRubro(CatalogoPresupuestoDTO datos, CancellationToken ct) =>
        GuardarConId<int>("usp_RubroPresupuesto_Guardar", datos, "IdRubroPresupuesto", DbType.Int32, ct);

    public Task<long> Crear(CrearPresupuestoDTO datos, CancellationToken ct) =>
        GuardarConId<long>("usp_Presupuesto_Crear", new
        {
            datos.Nombre, FechaInicio = FechaSql(datos.FechaInicio), FechaFin = FechaSql(datos.FechaFin),
            datos.Moneda, datos.IdFinca, datos.IdOperacion, datos.Motivo,
            PartidasJson = JsonSerializer.Serialize(datos.Partidas, JsonSerializerOptions.Web)
        }, "IdPresupuesto", DbType.Int64, ct);

    public Task Aprobar(long id, OperacionPresupuestoDTO datos, CancellationToken ct) =>
        Ejecutar("usp_Presupuesto_Aprobar", new { IdPresupuesto = id, datos.IdOperacion, datos.Motivo }, ct);

    public Task EditarBorrador(long id, EditarBorradorPresupuestoDTO datos, CancellationToken ct) =>
        Ejecutar("usp_Presupuesto_EditarBorrador", new
        {
            IdPresupuesto = id, datos.Version, datos.Nombre, datos.IdFinca,
            FechaInicio = FechaSql(datos.FechaInicio), FechaFin = FechaSql(datos.FechaFin), datos.Moneda,
            datos.IdOperacion, PartidasJson = JsonSerializer.Serialize(datos.Partidas, JsonSerializerOptions.Web)
        }, ct);

    public Task EstablecerMonto(long id, EstablecerMontoPartidaDTO datos, CancellationToken ct)
    {
        var parametros = new DynamicParameters(new { IdPartidaPresupuesto = id, datos.IdOperacion, datos.Motivo });
        parametros.Add("NuevoMonto", datos.NuevoMonto, DbType.Decimal, precision: 18, scale: 4);
        parametros.Add("MontoAprobadoEsperado", datos.MontoAprobadoEsperado, DbType.Decimal, precision: 28, scale: 4);
        return Ejecutar("usp_Presupuesto_EstablecerMonto", parametros, ct);
    }

    public Task Cerrar(long id, OperacionPresupuestoDTO datos, CancellationToken ct) =>
        Ejecutar("usp_Presupuesto_Cerrar", new { IdPresupuesto = id, datos.IdOperacion, datos.Motivo }, ct);

    public Task Ajustar(long id, AjustarPartidaDTO datos, CancellationToken ct)
    {
        var parametros = new DynamicParameters(new { IdPartidaPresupuesto = id, datos.IdOperacion, datos.Motivo });
        parametros.Add("Ajuste", datos.Ajuste, DbType.Decimal, precision: 18, scale: 4);
        return Ejecutar("usp_Presupuesto_AjustarPartida", parametros, ct);
    }

    public Task<long> RegistrarCompromiso(RegistrarCompromisoDTO datos, CancellationToken ct) =>
        GuardarConId<long>("usp_Compromiso_Registrar", new
        {
            FechaCompromiso = FechaSql(datos.FechaCompromiso), datos.Moneda, datos.IdSolicitudCotizacion,
            datos.IdOperacion, datos.Motivo, DistribucionJson = JsonSerializer.Serialize(datos.Distribucion, JsonSerializerOptions.Web)
        }, "IdCompromisoCompra", DbType.Int64, ct);

    public Task FinalizarCompromiso(long id, FinalizarCompromisoDTO datos, CancellationToken ct) =>
        Ejecutar("usp_Compromiso_Finalizar", new { IdCompromisoCompra = id, datos.Estado, datos.IdOperacion, datos.Motivo }, ct);

    public Task<OpcionesImputacionDTO> Opciones(DateOnly fecha, string moneda, int? idProducto,
        int? idPresentacionProducto, int? idProveedor, CancellationToken ct) =>
        ConsultarVarias("usp_Presupuesto_OpcionesImputacion",
            new { Fecha = FechaSql(fecha), moneda, idProducto, idPresentacionProducto, idProveedor },
            async filas => new OpcionesImputacionDTO((await filas.ReadAsync<OpcionPartidaDTO>()).AsList(),
                (await filas.ReadAsync<OpcionCompromisoDTO>()).AsList()), ct);

    public Task<IReadOnlyList<ImputacionActivaDTO>> ConsultarCompra(long id, CancellationToken ct) =>
        ListarFilas<ImputacionActivaDTO>("usp_Presupuesto_ConsultarCompra", new { IdCompra = id }, ct);

    public Task ImputarCompra(long id, ImputacionCompraDTO datos, CancellationToken ct) =>
        Ejecutar("usp_Presupuesto_ImputarCompra", new
        {
            IdCompra = id, datos.IdOperacion, datos.Motivo, datos.MotivoExceso,
            DistribucionJson = JsonSerializer.Serialize(datos.Distribucion, JsonSerializerOptions.Web)
        }, ct);

    public Task RevertirCompra(long id, OperacionPresupuestoDTO datos, CancellationToken ct) =>
        Ejecutar("usp_Presupuesto_RevertirCompra", new { IdCompra = id, datos.IdOperacion, datos.Motivo }, ct);

    private static DbString FechaSql(DateOnly fecha) =>
        new() { Value = fecha.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture), IsAnsi = true, Length = 10 };

    private static DateTime? ComoUtc(DateTime? fecha) =>
        fecha is { } valor ? DateTime.SpecifyKind(valor, DateTimeKind.Utc) : null;

    private Task<IReadOnlyList<T>> ListarFilas<T>(string sp, object parametros, CancellationToken ct) =>
        ConConexion<IReadOnlyList<T>>(sp, parametros, async (conexion, comando) =>
            (await conexion.QueryAsync<T>(comando)).AsList(), ct);

    private Task<T> ConsultarVarias<T>(string sp, object? parametros, Func<SqlMapper.GridReader, Task<T>> leer, CancellationToken ct) =>
        ConConexion(sp, parametros, async (conexion, comando) =>
        {
            using var filas = await conexion.QueryMultipleAsync(comando);
            return await leer(filas);
        }, ct);

    private Task Ejecutar(string sp, object parametros, CancellationToken ct) =>
        ConConexion(sp, parametros, (conexion, comando) => conexion.ExecuteAsync(comando), ct);

    private async Task<T> GuardarConId<T>(string sp, object datos, string nombreId, DbType tipo, CancellationToken ct)
    {
        var parametros = new DynamicParameters(datos);
        parametros.Add(nombreId, dbType: tipo, direction: ParameterDirection.InputOutput);
        await Ejecutar(sp, parametros, ct);
        return parametros.Get<T>(nombreId);
    }

    private async Task<T> ConConexion<T>(string sp, object? parametros,
        Func<IDbConnection, CommandDefinition, Task<T>> ejecutar, CancellationToken ct)
    {
        using var conexion = conexionBD.ObtenerConexion();
        try
        {
            return await ejecutar(conexion, new CommandDefinition(sp, parametros,
                commandType: CommandType.StoredProcedure, cancellationToken: ct));
        }
        catch (SqlException error) when (ErroresPresupuestoSql.EsErrorConocido(error))
        {
            throw ErroresPresupuestoSql.Traducir(error);
        }
    }
}
