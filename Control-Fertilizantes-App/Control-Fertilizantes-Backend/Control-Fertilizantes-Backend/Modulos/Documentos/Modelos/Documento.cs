namespace Control_Fertilizantes_Backend.Modulos.Documentos.Modelos;
public class Documento
{
    public long IdDocumento { get; set; }
    public required string NombreOriginal { get; set; }
    public required string RutaAlmacenamiento { get; set; }
    public required byte[] Sha256 { get; set; }
    public long TamanoBytes { get; set; }
    public required string TipoContenido { get; set; }
    public required string Origen { get; set; }
    public string? VersionPlantilla { get; set; }
    public DateTime FechaRegistro { get; set; }
}
public record IdentidadDocumentoSolicitud(long IdSolicitud, int VersionSolicitud, long IdDestinatario);
public record ArchivoDocumentoGuardado(string Clave, byte[] Sha256, long TamanoBytes);
public record ArchivoDocumentoDescarga(byte[] Contenido, string Nombre);
