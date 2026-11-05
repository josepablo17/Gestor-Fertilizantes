using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Modelos;
using Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Modelos;

namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Contratos;

public interface ILectorRespuestaPdf
{
    ExtraccionProforma Leer(byte[] contenido, Solicitud solicitud, SolicitudDestinatario destinatario, string? plantillaEnviada);
}
