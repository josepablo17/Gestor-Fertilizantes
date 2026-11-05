using System.Net;

namespace Control_Fertilizantes_Backend.Exceptions;

public sealed record ErrorSqlTraducido(HttpStatusCode Estado, string Mensaje);
