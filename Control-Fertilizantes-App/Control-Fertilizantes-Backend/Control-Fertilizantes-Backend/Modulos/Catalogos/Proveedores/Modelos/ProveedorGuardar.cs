namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.Modelos;

// Datos normalizados para persistir; separados de las entradas HTTP y de las consultas.
public class ProveedorGuardar
{
    public int IdProveedor { get; set; }
    public required string Nombre { get; set; }
    public string? Contacto { get; set; }
    public string? Telefono { get; set; }
    public string? Correo { get; set; }
    public string? Direccion { get; set; }
    public string? Provincia { get; set; }
    public string? Canton { get; set; }
    public string? Distrito { get; set; }
    public string? FuenteExterna { get; set; }
    public string? IdExterno { get; set; }
    public string? TipoIdentificacion { get; set; }
    public string? IdentificacionFiscal { get; set; }
    public string? PaisIdentificacion { get; set; }
    public bool EsProveedorAutorizado { get; set; }
    public DateTime? FechaUltimaSincronizacion { get; set; }
}
