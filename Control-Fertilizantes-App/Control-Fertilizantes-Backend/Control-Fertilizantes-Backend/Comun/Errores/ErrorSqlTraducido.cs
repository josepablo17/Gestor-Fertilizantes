using System.Net;

namespace Control_Fertilizantes_Backend.Comun.Errores;

public sealed record ErrorSqlTraducido(HttpStatusCode Estado, string Mensaje);
