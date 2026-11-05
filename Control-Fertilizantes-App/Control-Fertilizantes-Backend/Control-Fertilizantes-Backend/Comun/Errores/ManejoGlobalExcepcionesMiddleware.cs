using Control_Fertilizantes_Backend.Comun.Respuestas;
using System.Net;
using Microsoft.Data.SqlClient;

namespace Control_Fertilizantes_Backend.Comun.Errores;

public class ManejoGlobalExcepcionesMiddleware
{
    private readonly RequestDelegate _siguiente;
    private readonly ILogger<ManejoGlobalExcepcionesMiddleware> _logger;

    public ManejoGlobalExcepcionesMiddleware(
        RequestDelegate siguiente,
        ILogger<ManejoGlobalExcepcionesMiddleware> logger)
    {
        _siguiente = siguiente;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext contexto)
    {
        try
        {
            await _siguiente(contexto);
        }
        catch (OperationCanceledException) when (contexto.RequestAborted.IsCancellationRequested)
        {
            // El cliente ya cerro la solicitud; no convertir la cancelacion en HTTP 500.
        }
        catch (ReglaNegocio excepcion) when (!contexto.Response.HasStarted)
        {
            _logger.LogWarning(excepcion, "Regla de negocio. Solicitud {Solicitud}.", contexto.TraceIdentifier);
            await ResponderAsync(contexto, excepcion.Message, excepcion.StatusCode);
        }
        catch (SqlException excepcion) when (!contexto.Response.HasStarted)
        {
            var error = TraductorErroresSql.Traducir(excepcion);
            _logger.Log(error.Estado == HttpStatusCode.InternalServerError ? LogLevel.Error : LogLevel.Warning,
                excepcion, "Error SQL {Numero}. Solicitud {Solicitud}.", excepcion.Number, contexto.TraceIdentifier);
            await ResponderAsync(contexto, error.Mensaje, error.Estado);
        }
        catch (Exception excepcion) when (!contexto.Response.HasStarted)
        {
            _logger.LogError(excepcion, "Error interno. Solicitud {Solicitud}.", contexto.TraceIdentifier);
            await ResponderAsync(contexto, "Ocurrió un error interno en el servidor.", HttpStatusCode.InternalServerError);
        }
    }

    private static Task ResponderAsync(HttpContext contexto, string mensaje, HttpStatusCode estado)
    {
        contexto.Response.StatusCode = (int)estado;
        return contexto.Response.WriteAsJsonAsync(ApiRespuesta<object>.CrearError(mensaje),
            cancellationToken: contexto.RequestAborted);
    }
}