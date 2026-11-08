using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Control_Fertilizantes_Backend.Modulos.Documentos.Modelos;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Contratos;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Modelos;

namespace Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Solicitudes;

public class SolicitudRepositorio(IConexionBD conexionBD) : ISolicitudRepositorio
{
    private static CommandDefinition Comando(string nombre, object parametros, CancellationToken ct, IDbTransaction? transaccion = null) =>
        new("dbo." + nombre, parametros, transaccion, commandType: CommandType.StoredProcedure, cancellationToken: ct);

    public async Task<long> GuardarBorradorAsync(long? id, SolicitudGuardar datos, CancellationToken cancelacion)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var p = new DynamicParameters();
        p.Add("@IdSolicitudCotizacion", id, DbType.Int64, direction: ParameterDirection.InputOutput);
        p.Add("@FechaSolicitud", datos.FechaSolicitud, DbType.Date);
        p.Add("@FechaLimiteRespuesta", datos.FechaLimiteRespuesta, DbType.Date);
        p.Add("@DatosClienteOriginalJson", datos.DatosClienteOriginalJson, DbType.String, size: -1);
        p.Add("@Observaciones", datos.Observaciones, DbType.String, size: 2000);
        p.Add("@LineasJson", datos.LineasJson, DbType.String, size: -1);
        p.Add("@ProveedoresJson", datos.ProveedoresJson, DbType.String, size: -1);
        await conexion.ExecuteAsync(Comando("usp_Solicitud_GuardarBorrador", p, cancelacion));
        return p.Get<long>("@IdSolicitudCotizacion");
    }

    public async Task<Solicitud> ObtenerAsync(long id, CancellationToken cancelacion)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var p = new DynamicParameters(); p.Add("@IdSolicitudCotizacion", id, DbType.Int64);
        using var resultados = await conexion.QueryMultipleAsync(Comando("usp_Solicitud_ObtenerPorId", p, cancelacion));
        var solicitud = await resultados.ReadSingleAsync<Solicitud>();
        solicitud.Lineas = (await resultados.ReadAsync<SolicitudLinea>()).ToList();
        solicitud.Destinatarios = (await resultados.ReadAsync<SolicitudDestinatario>()).ToList();
        return solicitud;
    }

    public async Task<IReadOnlyList<SolicitudListadoRegistro>> ListarAsync(string? estado, string? buscar, int pagina, int tamano, CancellationToken cancelacion)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var p = new DynamicParameters();
        p.Add("@Estado", estado, DbType.AnsiString, size: 20);
        p.Add("@Buscar", buscar, DbType.String, size: 50);
        p.Add("@Pagina", pagina, DbType.Int32); p.Add("@TamanoPagina", tamano, DbType.Int32);
        return (await conexion.QueryAsync<SolicitudListadoRegistro>(Comando("usp_Solicitud_Listar", p, cancelacion))).ToList();
    }

    public async Task EmitirAsync(long id, CancellationToken cancelacion)
    {
        using var conexion = conexionBD.ObtenerConexion();
        await conexion.ExecuteAsync(Comando("usp_Solicitud_Emitir", new { IdSolicitudCotizacion = id }, cancelacion));
    }

    public async Task<long> CrearRevisionAsync(long id, CancellationToken cancelacion)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var p = new DynamicParameters(); p.Add("@IdSolicitudCotizacion", id, DbType.Int64);
        p.Add("@IdNuevaSolicitud", dbType: DbType.Int64, direction: ParameterDirection.Output);
        await conexion.ExecuteAsync(Comando("usp_Solicitud_CrearRevision", p, cancelacion));
        return p.Get<long>("@IdNuevaSolicitud");
    }

    public async Task CambiarEstadoAsync(long id, string estado, CancellationToken cancelacion)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var p = new DynamicParameters(); p.Add("@IdSolicitudCotizacion", id, DbType.Int64);
        p.Add("@Estado", estado, DbType.AnsiString, size: 20);
        await conexion.ExecuteAsync(Comando("usp_Solicitud_CambiarEstado", p, cancelacion));
    }

    public async Task<Documento> ObtenerDocumentoAsync(long id, CancellationToken cancelacion)
    {
        using var conexion = conexionBD.ObtenerConexion();
        return await conexion.QuerySingleAsync<Documento>(Comando("usp_Documento_ObtenerPorId", new { IdDocumento = id }, cancelacion));
    }

    public async Task<long?> RegistrarDocumentoAsync(long idSolicitud, long idDestinatario, string nombre, string versionPlantilla, ArchivoDocumentoGuardado archivo, CancellationToken cancelacion)
    {
        using var conexion = (SqlConnection)conexionBD.ObtenerConexion();
        await conexion.OpenAsync(cancelacion);
        await using var transaccion = (SqlTransaction)await conexion.BeginTransactionAsync(cancelacion);
        try
        {
            var p = new DynamicParameters();
            p.Add("@NombreOriginal", nombre, DbType.String, size: 255);
            p.Add("@RutaAlmacenamiento", archivo.Clave, DbType.String, size: 800);
            p.Add("@Sha256", archivo.Sha256, DbType.Binary, size: 32);
            p.Add("@TamanoBytes", archivo.TamanoBytes, DbType.Int64);
            p.Add("@Origen", "Generado", DbType.AnsiString, size: 20);
            p.Add("@VersionPlantilla", versionPlantilla, DbType.String, size: 40);
            p.Add("@IdDocumento", dbType: DbType.Int64, direction: ParameterDirection.Output);
            await conexion.ExecuteAsync(Comando("usp_Documento_Registrar", p, cancelacion, transaccion));
            var id = p.Get<long>("@IdDocumento");
            await conexion.ExecuteAsync(Comando("usp_Solicitud_AsignarDocumento", new
            { IdSolicitudCotizacion = idSolicitud, IdSolicitudCotizacionProveedor = idDestinatario, IdDocumento = id }, cancelacion, transaccion));
            // Una cancelacion del cliente no debe interrumpir la confirmacion iniciada.
            await transaccion.CommitAsync(CancellationToken.None);
            return id;
        }
        catch (SqlException error) when (error.Number == 52009)
        {
            await transaccion.RollbackAsync(CancellationToken.None);
            return null; // Otra peticion ya reservo el original; el rollback esta confirmado.
        }
        catch
        {
            try { await transaccion.RollbackAsync(CancellationToken.None); } catch (Exception) { /* Conservar el archivo si el resultado del commit es incierto. */ }
            throw;
        }
    }

    public async Task RegistrarEnvioAsync(long idSolicitud, long idDestinatario, long idDocumento, DateTime fecha, CancellationToken cancelacion)
    {
        using var conexion = (SqlConnection)conexionBD.ObtenerConexion();
        await conexion.OpenAsync(cancelacion);
        await using var transaccion = (SqlTransaction)await conexion.BeginTransactionAsync(cancelacion);
        await conexion.ExecuteAsync(Comando("usp_Solicitud_AsignarDocumento", new
        { IdSolicitudCotizacion = idSolicitud, IdSolicitudCotizacionProveedor = idDestinatario, IdDocumento = idDocumento }, cancelacion, transaccion));
        var p = new DynamicParameters();
        p.Add("@IdSolicitudCotizacionProveedor", idDestinatario, DbType.Int64);
        p.Add("@IdDocumentoEnviado", idDocumento, DbType.Int64);
        p.Add("@FechaEnvio", fecha, DbType.DateTime2, scale: 3);
        await conexion.ExecuteAsync(Comando("usp_Solicitud_RegistrarEnvio", p, cancelacion, transaccion));
        await transaccion.CommitAsync(CancellationToken.None);
    }
}
