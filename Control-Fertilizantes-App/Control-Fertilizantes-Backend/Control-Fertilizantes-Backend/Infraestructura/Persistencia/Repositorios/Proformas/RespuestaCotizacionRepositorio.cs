using System.Data;
using System.Text.Json;
using Control_Fertilizantes_Backend.Modulos.Documentos.Modelos;
using Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Contratos;
using Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;

namespace Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Proformas;

public sealed class RespuestaCotizacionRepositorio(IConexionBD conexionBD) : IRespuestaCotizacionRepositorio
{
    // La cabecera es un reemplazo completo, incluso si todos los campos están vacíos.
    // OPENJSON con esquema explícito no entrega una fila para un objeto {}.
    private static readonly JsonSerializerOptions JsonWeb = new(JsonSerializerDefaults.Web);

    private static CommandDefinition Comando(string nombre, object parametros, CancellationToken ct, IDbTransaction? transaccion = null) =>
        new("dbo." + nombre, parametros, transaccion, commandType: CommandType.StoredProcedure, cancellationToken: ct);

    public async Task<int> RegistrarAsync(long idDestinatario, string nombre, ArchivoDocumentoGuardado archivo, BorradorRespuesta borrador, CancellationToken ct)
    {
        using var conexion = (SqlConnection)conexionBD.ObtenerConexion();
        await conexion.OpenAsync(ct);
        await using var tx = (SqlTransaction)await conexion.BeginTransactionAsync(ct);
        var confirmando = false;
        try
        {
            var doc = new DynamicParameters();
            doc.Add("@NombreOriginal", nombre, DbType.String, size: 255);
            doc.Add("@RutaAlmacenamiento", archivo.Clave, DbType.String, size: 800);
            doc.Add("@Sha256", archivo.Sha256, DbType.Binary, size: 32);
            doc.Add("@TamanoBytes", archivo.TamanoBytes, DbType.Int64);
            doc.Add("@Origen", "Recibido", DbType.AnsiString, size: 20);
            doc.Add("@VersionPlantilla", borrador.Extraccion.VersionPlantilla, DbType.String, size: 40);
            doc.Add("@IdDocumento", dbType: DbType.Int64, direction: ParameterDirection.Output);
            await conexion.ExecuteAsync(Comando("usp_Documento_Registrar", doc, ct, tx));
            var idDocumento = doc.Get<long>("@IdDocumento");

            var intento = new DynamicParameters();
            intento.Add("@IdDocumento", idDocumento, DbType.Int64);
            intento.Add("@VersionLector", borrador.Extraccion.VersionLector, DbType.String, size: 50);
            intento.Add("@Metodo", borrador.Extraccion.Metodo, DbType.AnsiString, size: 20);
            intento.Add("@Estado", borrador.Extraccion.Estado, DbType.AnsiString, size: 30);
            // Conservar también los valores nulos: campo existente sin valor y cadena vacía son evidencia distinta.
            intento.Add("@DatosExtraidosJson", JsonSerializer.Serialize(borrador.Extraccion.Campos, JsonWeb), DbType.String, size: -1);
            intento.Add("@AdvertenciasJson", JsonSerializer.Serialize(borrador.Extraccion.Advertencias, JsonWeb), DbType.String, size: -1);
            intento.Add("@IdImportacionDocumento", dbType: DbType.Int64, direction: ParameterDirection.Output);
            await conexion.ExecuteAsync(Comando("usp_Importacion_Registrar", intento, ct, tx));

            var respuesta = new DynamicParameters();
            respuesta.Add("@IdSolicitudCotizacionProveedor", idDestinatario, DbType.Int64);
            respuesta.Add("@IdDocumentoOrigen", idDocumento, DbType.Int64);
            respuesta.Add("@IdImportacionDocumento", intento.Get<long>("@IdImportacionDocumento"), DbType.Int64);
            AgregarJson(respuesta, "@CabeceraJson", borrador.Cabecera);
            AgregarJson(respuesta, "@LineasJson", borrador.Lineas);
            respuesta.Add("@IdProformaProveedor", dbType: DbType.Int32, direction: ParameterDirection.Output);
            await conexion.ExecuteAsync(Comando("usp_Proforma_GuardarBorrador", respuesta, ct, tx));
            var id = respuesta.Get<int>("@IdProformaProveedor");
            confirmando = true;
            await tx.CommitAsync(CancellationToken.None);
            return id;
        }
        catch (Exception error) when (confirmando)
        {
            throw new ConfirmacionRespuestaIncierta(error);
        }
        catch
        {
            // Aún no se envió COMMIT; cerrar la conexión también revierte la transacción.
            if (tx.Connection is not null)
            {
                try { await tx.RollbackAsync(CancellationToken.None); }
                catch (Exception error) when (error is SqlException or InvalidOperationException) { }
            }
            throw;
        }
    }

    public async Task<RespuestaCompleta> ObtenerAsync(int id, CancellationToken ct)
    {
        using var conexion = conexionBD.ObtenerConexion();
        using var grid = await conexion.QueryMultipleAsync(Comando("usp_Proforma_ObtenerCompleta", new { IdProformaProveedor = id }, ct));
        var cabecera = await grid.ReadSingleAsync<RespuestaRegistro>();
        var lineas = (await grid.ReadAsync<LineaRespuestaRegistro>()).AsList();
        var historial = (await grid.ReadAsync<CambioRespuestaRegistro>()).AsList();
        return new(cabecera, lineas, historial);
    }

    public async Task<IReadOnlyList<RespuestaRegistro>> ListarAsync(long idSolicitud, int idProveedor, int pagina, int tamano, CancellationToken ct)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var args = new { IdSolicitudCotizacion = idSolicitud, IdProveedor = idProveedor, Pagina = pagina, TamanoPagina = tamano };
        return (await conexion.QueryAsync<RespuestaRegistro>(Comando("SP_ProformaProveedor_Listar", args, ct))).AsList();
    }

    public async Task<ImportacionRespuestaRegistro?> ObtenerImportacionAsync(long idDocumento, long idImportacion, CancellationToken ct)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var intentos = await conexion.QueryAsync<ImportacionRespuestaRegistro>(Comando("usp_Importacion_ListarPorDocumento", new { IdDocumento = idDocumento }, ct));
        return intentos.SingleOrDefault(x => x.IdImportacionDocumento == idImportacion);
    }

    private async Task EjecutarAsync(string procedimiento, object args, CancellationToken ct)
    {
        using var conexion = conexionBD.ObtenerConexion();
        await conexion.ExecuteAsync(Comando(procedimiento, args, ct));
    }

    public Task AjustarCabeceraAsync(int id, CabeceraGuardarRespuesta cabecera, string? motivo, CancellationToken ct)
    {
        var args = Motivo(id, motivo);
        AgregarJson(args, "@CabeceraJson", cabecera);
        return EjecutarAsync("usp_Proforma_ActualizarCabecera", args, ct);
    }

    public Task AjustarLineaAsync(int idLinea, LineaGuardarRespuesta linea, string motivo, CancellationToken ct)
    {
        var args = Motivo(idLinea, motivo, esLinea: true);
        AgregarJson(args, "@LineaJson", linea);
        return EjecutarAsync("usp_Proforma_ActualizarLinea", args, ct);
    }

    public Task AgregarLineaAsync(int id, LineaGuardarRespuesta linea, string motivo, CancellationToken ct)
    {
        var args = Motivo(id, motivo);
        AgregarJson(args, "@LineaJson", linea);
        args.Add("@IdProformaProveedorDetalle", dbType: DbType.Int32, direction: ParameterDirection.Output);
        return EjecutarAsync("usp_Proforma_AgregarLinea", args, ct);
    }

    public Task RevisarLineaAsync(int idLinea, string? motivo, CancellationToken ct) =>
        EjecutarAsync("usp_Proforma_RevisarLinea", Motivo(idLinea, motivo, esLinea: true), ct);

    public Task ConciliarAsync(int id, string estado, string? motivo, decimal tolerancia, CancellationToken ct)
    {
        var args = Motivo(id, motivo);
        args.Add("@EstadoConciliacion", estado, DbType.AnsiString, size: 20);
        args.Add("@Tolerancia", tolerancia, DbType.Decimal, precision: 18, scale: 4);
        return EjecutarAsync("usp_Proforma_Conciliar", args, ct);
    }

    public Task ValidarAsync(int id, CancellationToken ct) =>
        EjecutarAsync("usp_Proforma_Validar", new { IdProformaProveedor = id }, ct);

    public Task CancelarAsync(int id, string motivo, CancellationToken ct) =>
        EjecutarAsync("usp_Proforma_CancelarBorrador", Motivo(id, motivo), ct);

    public async Task<int> CrearRevisionAsync(int id, CancellationToken ct)
    {
        var args = new DynamicParameters(new { IdProformaProveedor = id });
        args.Add("@IdNuevaProforma", dbType: DbType.Int32, direction: ParameterDirection.Output);
        await EjecutarAsync("usp_Proforma_CrearRevision", args, ct);
        return args.Get<int>("@IdNuevaProforma");
    }

    private static void AgregarJson<T>(DynamicParameters args, string nombre, T datos) =>
        args.Add(nombre, JsonSerializer.Serialize(datos, JsonWeb), DbType.String, size: -1);

    private static DynamicParameters Motivo(int id, string? motivo, bool esLinea = false)
    {
        var args = new DynamicParameters();
        args.Add(esLinea ? "@IdProformaProveedorDetalle" : "@IdProformaProveedor", id, DbType.Int32);
        args.Add("@Motivo", motivo, DbType.String, size: 1000);
        return args;
    }
}
