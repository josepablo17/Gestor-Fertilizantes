namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Modelos;

public class RespuestaRegistro
{
    public int IdProformaProveedor { get; set; }
    public long IdSolicitudCotizacion { get; set; }
    public long IdSolicitudCotizacionProveedor { get; set; }
    public int IdProveedor { get; set; }
    public int VersionSolicitud { get; set; }
    public int VersionRespuesta { get; set; }
    public int? IdProformaAnterior { get; set; }
    public long? IdDocumentoOrigen { get; set; }
    public long? IdImportacionDocumento { get; set; }
    public string NombreProveedor { get; set; } = "";
    public string Estado { get; set; } = "";
    public string EstadoConciliacion { get; set; } = "";
    public string? JustificacionConciliacion { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaValidacion { get; set; }
    public long TotalRegistros { get; set; }
    public string? NumeroProforma { get; set; }
    public DateTime? FechaProforma { get; set; }
    public DateTime? FechaVencimiento { get; set; }
    public int? DiasCredito { get; set; }
    public string? TipoDocumento { get; set; }
    public string? Moneda { get; set; }
    public string? NombreProveedorPdf { get; set; }
    public string? NombreNegocio { get; set; }
    public string? RazonSocial { get; set; }
    public string? Cedula { get; set; }
    public string? Telefono { get; set; }
    public string? Vendedor { get; set; }
    public decimal? Subtotal { get; set; }
    public decimal? Descuento { get; set; }
    public decimal? Iva { get; set; }
    public decimal? OtrosCargos { get; set; }
    public decimal? Total { get; set; }
    public string? DatosProveedorOriginalJson { get; set; }
    public string? DatosClienteOriginalJson { get; set; }
    public string? CondicionesPago { get; set; }
    public string? CondicionesEntrega { get; set; }
    public string? Observaciones { get; set; }
}
