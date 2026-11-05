using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Modelos;
using Control_Fertilizantes_Backend.Modulos.Documentos.Modelos;
namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Contratos;
public interface ISolicitudRepositorio
{
    Task<long> GuardarBorradorAsync(long? id, SolicitudGuardar datos, CancellationToken cancelacion);
    Task<Solicitud> ObtenerAsync(long id, CancellationToken cancelacion);
    Task<IReadOnlyList<SolicitudListadoRegistro>> ListarAsync(string? estado, string? buscar, int pagina, int tamano, CancellationToken cancelacion);
    Task EmitirAsync(long id, CancellationToken cancelacion);
    Task<long> CrearRevisionAsync(long id, CancellationToken cancelacion);
    Task CambiarEstadoAsync(long id, string estado, CancellationToken cancelacion);
    Task<Documento> ObtenerDocumentoAsync(long id, CancellationToken cancelacion);
    Task<long?> RegistrarDocumentoAsync(long idSolicitud, long idDestinatario, string nombre, string versionPlantilla, ArchivoDocumentoGuardado archivo, CancellationToken cancelacion);
    Task RegistrarEnvioAsync(long idSolicitud, long idDestinatario, long idDocumento, DateTime fecha, CancellationToken cancelacion);
}
