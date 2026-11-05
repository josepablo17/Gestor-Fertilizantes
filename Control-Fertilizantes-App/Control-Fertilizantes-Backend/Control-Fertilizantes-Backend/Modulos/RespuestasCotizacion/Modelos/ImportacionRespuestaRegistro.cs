namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Modelos;

public class ImportacionRespuestaRegistro
{
    public long IdImportacionDocumento { get; set; }
    public string VersionLector { get; set; } = "";
    public string Metodo { get; set; } = "";
    public string Estado { get; set; } = "";
    public string? DatosExtraidosJson { get; set; }
    public string? AdvertenciasJson { get; set; }
    public DateTime FechaImportacion { get; set; }
}
