using Control_Fertilizantes_Backend.Modulos.Documentos.Modelos;
namespace Control_Fertilizantes_Backend.Modulos.Documentos.Contratos;
public interface IAlmacenDocumentos
{
    Task<ArchivoDocumentoGuardado> GuardarAsync(IdentidadDocumentoSolicitud identidad, byte[] contenido, CancellationToken cancelacion);
    Task<byte[]> LeerVerificadoAsync(IdentidadDocumentoSolicitud identidad, Documento documento, CancellationToken cancelacion);
    Task EliminarNoRegistradoAsync(string clave);
}
