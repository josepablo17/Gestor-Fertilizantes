namespace Control_Fertilizantes_Backend.DTOs
{
    public class ApiRespuesta<T>
    {
        public bool Exito { get; set; }
        public string Mensaje { get; set; } = string.Empty;
        public T? Data { get; set; }

        public static ApiRespuesta<T> CrearExito(string mensaje, T? data = default)
        {
            return new ApiRespuesta<T>
            {
                Exito = true,
                Mensaje = mensaje,
                Data = data
            };
        }

        public static ApiRespuesta<T> CrearError(string mensaje)
        {
            return new ApiRespuesta<T>
            {
                Exito = false,
                Mensaje = mensaje,
                Data = default
            };
        }
    }
}
