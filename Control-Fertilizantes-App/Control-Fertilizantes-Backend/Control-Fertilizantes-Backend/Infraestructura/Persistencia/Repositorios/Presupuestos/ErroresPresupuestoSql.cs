using System.Net;
using Control_Fertilizantes_Backend.Comun.Errores;
using Microsoft.Data.SqlClient;

namespace Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Presupuestos;

internal static class ErroresPresupuestoSql
{
    internal static bool EsErrorConocido(SqlException error) =>
        error.Number is 52000 or 52004 or 52009 or 52010 or 2601 or 2627;

    internal static ReglaNegocio Traducir(SqlException error) => error.Number switch
    {
        52000 => new(error.Errors[0].Message),
        52004 => new(error.Errors[0].Message, HttpStatusCode.NotFound),
        52009 or 52010 => new(error.Errors[0].Message, HttpStatusCode.Conflict),
        _ => new("Ya existe un registro con ese código.", HttpStatusCode.Conflict)
    };
}
