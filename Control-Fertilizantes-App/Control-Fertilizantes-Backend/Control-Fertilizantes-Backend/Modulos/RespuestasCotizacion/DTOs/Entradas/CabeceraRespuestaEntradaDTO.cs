using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System.Text.Json;
using Control_Fertilizantes_Backend.Comun.Validacion;

namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.DTOs.Entradas;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class CabeceraRespuestaEntradaDTO
{
    [StringLength(50, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? NumeroProforma { get; init; }
    public DateOnly? FechaProforma { get; init; }
    public DateOnly? FechaVencimiento { get; init; }
    [Range(0, int.MaxValue, ErrorMessage = "Los días de crédito no pueden ser negativos.")] public int? DiasCredito { get; init; }
    [StringLength(50, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? TipoDocumento { get; init; }
    [StringLength(3, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? Moneda { get; init; }
    [StringLength(200, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? NombreProveedorPdf { get; init; }
    [StringLength(250, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? NombreNegocio { get; init; }
    [StringLength(250, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? RazonSocial { get; init; }
    [StringLength(50, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? Cedula { get; init; }
    [StringLength(50, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? Telefono { get; init; }
    [StringLength(150, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? Vendedor { get; init; }
    [DecimalOferta(18, 4), JsonConverter(typeof(DecimalOfertaJsonConverter))]
    public decimal? Subtotal { get; init; }
    [DecimalOferta(18, 4), JsonConverter(typeof(DecimalOfertaJsonConverter))]
    public decimal? Descuento { get; init; }
    [DecimalOferta(18, 4), JsonConverter(typeof(DecimalOfertaJsonConverter))]
    public decimal? Iva { get; init; }
    [DecimalOferta(18, 4), JsonConverter(typeof(DecimalOfertaJsonConverter))]
    public decimal? OtrosCargos { get; init; }
    [DecimalOferta(18, 4), JsonConverter(typeof(DecimalOfertaJsonConverter))]
    public decimal? Total { get; init; }
    public JsonElement? DatosProveedorOriginal { get; init; }
    public JsonElement? DatosClienteOriginal { get; init; }
    [StringLength(1000, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? CondicionesPago { get; init; }
    [StringLength(1000, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? CondicionesEntrega { get; init; }
    [StringLength(2000, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? Observaciones { get; init; }
}
