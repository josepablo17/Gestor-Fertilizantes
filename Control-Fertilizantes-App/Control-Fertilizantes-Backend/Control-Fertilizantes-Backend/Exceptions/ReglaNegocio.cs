using System.Net;

namespace Control_Fertilizantes_Backend.Exceptions
{
    public class ReglaNegocio : Exception
    {
        public HttpStatusCode StatusCode { get; }

        public ReglaNegocio(string mensaje, HttpStatusCode statusCode = HttpStatusCode.BadRequest)
            : base(mensaje)
        {
            StatusCode = statusCode;
        }
    }
}
