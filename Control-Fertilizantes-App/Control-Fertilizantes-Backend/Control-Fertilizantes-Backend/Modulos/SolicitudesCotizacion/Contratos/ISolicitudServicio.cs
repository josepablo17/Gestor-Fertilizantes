using Control_Fertilizantes_Backend.Comun.Paginacion;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Documentos.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Documentos.Modelos;
namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Contratos;
public interface ISolicitudServicio
{
    Task<SolicitudRespuestaDTO> GuardarBorradorAsync(long? id, SolicitudGuardarBorradorDTO entrada, CancellationToken cancelacion);
    Task<SolicitudRespuestaDTO> ObtenerAsync(long id, CancellationToken cancelacion);
    Task<PaginaRespuesta<SolicitudListadoDTO>> ListarAsync(SolicitudConsultaDTO consulta, CancellationToken cancelacion);
    Task<SolicitudRespuestaDTO> EmitirAsync(long id, CancellationToken cancelacion);
    Task<SolicitudRespuestaDTO> CrearRevisionAsync(long id, CancellationToken cancelacion);
    Task<SolicitudRespuestaDTO> CambiarEstadoAsync(long id, SolicitudEstadoDTO entrada, CancellationToken cancelacion);
    Task<DocumentoRespuestaDTO> GenerarDocumentoAsync(long id, long idDestinatario, CancellationToken cancelacion);
    Task<ArchivoDocumentoDescarga> DescargarDocumentoAsync(long id, long idDestinatario, CancellationToken cancelacion);
    Task<SolicitudRespuestaDTO> RegistrarEnvioAsync(long id, long idDestinatario, SolicitudEnvioDTO entrada, CancellationToken cancelacion);
}
