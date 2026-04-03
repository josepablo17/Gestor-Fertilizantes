using System.Net;
using System.Text.Json;
using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Exceptions;
using Microsoft.Data.SqlClient;

namespace Control_Fertilizantes_Backend.Middlewares
{
    public class ManejoGlobalExcepcionesMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ManejoGlobalExcepcionesMiddleware> _logger;

        public ManejoGlobalExcepcionesMiddleware(
            RequestDelegate next,
            ILogger<ManejoGlobalExcepcionesMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (ReglaNegocio ex)
            {
                _logger.LogWarning(ex, "Regla de negocio detectada.");
                await ManejarExcepcionAsync(context, ex.Message, ex.StatusCode);
            }
            catch (SqlException ex) when (EsConflictoDuplicadoSQL(ex))
            {
                _logger.LogWarning(ex, "Conflicto de duplicado detectado desde SQL Server.");
                await ManejarExcepcionAsync(context, ex.Message, HttpStatusCode.Conflict);
            }
            catch (SqlException ex) when (EsRecursoNoEncontradoSQL(ex))
            {
                _logger.LogWarning(ex, "Recurso no encontrado detectado desde SQL Server.");
                await ManejarExcepcionAsync(context, ex.Message, HttpStatusCode.NotFound);
            }
            catch (SqlException ex) when (EsConflictoEstadoSQL(ex))
            {
                _logger.LogWarning(ex, "Conflicto de estado detectado desde SQL Server.");
                await ManejarExcepcionAsync(context, ex.Message, HttpStatusCode.Conflict);
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Error SQL no controlado.");
                await ManejarExcepcionAsync(
                    context,
                    "Ocurrió un error en la base de datos.",
                    HttpStatusCode.InternalServerError);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno no controlado.");
                await ManejarExcepcionAsync(
                    context,
                    "Ocurrió un error interno en el servidor.",
                    HttpStatusCode.InternalServerError);
            }
        }

        private static bool EsConflictoDuplicadoSQL(SqlException ex)
        {
            return ex.Number is 50001 or 50003;
        }

        private static bool EsRecursoNoEncontradoSQL(SqlException ex)
        {
            return ex.Number is 50002 or 50004;
        }

        private static bool EsConflictoEstadoSQL(SqlException ex)
        {
            return ex.Number is 50005;
        }

        private static async Task ManejarExcepcionAsync(
            HttpContext context,
            string mensaje,
            HttpStatusCode statusCode)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            var respuesta = ApiRespuesta<object>.CrearError(mensaje);

            var json = JsonSerializer.Serialize(respuesta);

            await context.Response.WriteAsync(json);
        }
    }
}