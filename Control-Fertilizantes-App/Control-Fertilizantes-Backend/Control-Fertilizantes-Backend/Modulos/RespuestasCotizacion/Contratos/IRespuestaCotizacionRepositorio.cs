using Control_Fertilizantes_Backend.Modulos.Documentos.Modelos;
using Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Modelos;

namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Contratos;

public interface IRespuestaCotizacionRepositorio
{
    Task<int> RegistrarAsync(long idDestinatario, string nombre, ArchivoDocumentoGuardado archivo, BorradorRespuesta borrador, CancellationToken cancelacion);
    Task<RespuestaCompleta> ObtenerAsync(int id, CancellationToken cancelacion);
    Task<IReadOnlyList<RespuestaRegistro>> ListarAsync(long idSolicitud, int idProveedor, int pagina, int tamano, CancellationToken cancelacion);
    Task<ImportacionRespuestaRegistro?> ObtenerImportacionAsync(long idDocumento, long idImportacion, CancellationToken cancelacion);
    Task AjustarCabeceraAsync(int id, CabeceraGuardarRespuesta cabecera, string motivo, CancellationToken cancelacion);
    Task AjustarLineaAsync(int idLinea, LineaGuardarRespuesta linea, string motivo, CancellationToken cancelacion);
    Task AgregarLineaAsync(int id, LineaGuardarRespuesta linea, string motivo, CancellationToken cancelacion);
    Task RevisarLineaAsync(int idLinea, string motivo, CancellationToken cancelacion);
    Task ConciliarAsync(int id, string estado, string motivo, decimal tolerancia, CancellationToken cancelacion);
    Task ValidarAsync(int id, CancellationToken cancelacion);
    Task CancelarAsync(int id, string motivo, CancellationToken cancelacion);
    Task<int> CrearRevisionAsync(int id, CancellationToken cancelacion);
}
