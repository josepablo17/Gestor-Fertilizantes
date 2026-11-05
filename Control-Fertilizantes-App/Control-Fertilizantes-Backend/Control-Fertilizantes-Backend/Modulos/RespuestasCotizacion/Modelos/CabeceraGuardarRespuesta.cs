using System.Text.Json;

namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Modelos;

public sealed class CabeceraGuardarRespuesta
{
    public string? NumeroProforma { get; set; }
    public DateOnly? FechaProforma { get; set; }
    public DateOnly? FechaVencimiento { get; set; }
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
    public JsonElement? DatosProveedorOriginal { get; set; }
    public JsonElement? DatosClienteOriginal { get; set; }
    public string? CondicionesPago { get; set; }
    public string? CondicionesEntrega { get; set; }
    public string? Observaciones { get; set; }
}
