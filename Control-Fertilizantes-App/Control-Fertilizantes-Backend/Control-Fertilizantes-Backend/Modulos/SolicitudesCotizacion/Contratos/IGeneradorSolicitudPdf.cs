using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Modelos;
namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Contratos;
public interface IGeneradorSolicitudPdf
{
    string VersionPlantilla { get; }
    byte[] Generar(Solicitud solicitud, SolicitudDestinatario destinatario);
}
