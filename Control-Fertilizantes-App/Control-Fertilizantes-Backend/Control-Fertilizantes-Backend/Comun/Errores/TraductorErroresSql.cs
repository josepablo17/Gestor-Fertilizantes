using System.Net;
using Microsoft.Data.SqlClient;

namespace Control_Fertilizantes_Backend.Comun.Errores;

public static class TraductorErroresSql
{
    public static ErrorSqlTraducido Traducir(SqlException excepcion)
    {
        // Un trigger puede agregar errores de cancelacion despues del error de negocio.
        foreach (SqlError error in excepcion.Errors)
        {
            var resultado = Traducir(error.Number);
            if (resultado.Estado != HttpStatusCode.InternalServerError)
                return resultado;
        }
        return Traducir(excepcion.Number);
    }

    public static ErrorSqlTraducido Traducir(int numero) => numero switch
    {
        52000 or 51201 or 51202 or 51203 =>
            new(HttpStatusCode.BadRequest, "Revise los datos enviados y las referencias a los catálogos."),
        52004 or 51204 or 50002 or 50004 =>
            new(HttpStatusCode.NotFound, "El recurso solicitado no existe."),
        52009 =>
            new(HttpStatusCode.Conflict, "Hay varias coincidencias. Seleccione explícitamente la opción correspondiente."),
        2601 or 2627 or 50001 or 50003 =>
            new(HttpStatusCode.Conflict, "Ya existe un registro con los mismos datos únicos."),
        547 =>
            new(HttpStatusCode.Conflict, "La operación entra en conflicto con datos relacionados o restricciones de integridad."),
        52010 or 51200 or 51205 or 51206 or 50005 =>
            new(HttpStatusCode.Conflict, "El estado actual no permite esta operación. Revise el registro antes de continuar."),
        >= 51100 and <= 51126 =>
            new(HttpStatusCode.Conflict, "La operación no respeta la integridad o la conservación del documento y sus datos."),
        _ => new(HttpStatusCode.InternalServerError, "Ocurrió un error en la base de datos.")
    };
}
