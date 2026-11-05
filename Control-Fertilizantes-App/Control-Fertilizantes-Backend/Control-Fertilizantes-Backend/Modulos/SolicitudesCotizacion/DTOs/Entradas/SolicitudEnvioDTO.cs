using System.Text.Json.Serialization;

namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.DTOs.Entradas;
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class SolicitudEnvioDTO
{
    public DateTimeOffset? FechaEnvio { get; set; }
}
