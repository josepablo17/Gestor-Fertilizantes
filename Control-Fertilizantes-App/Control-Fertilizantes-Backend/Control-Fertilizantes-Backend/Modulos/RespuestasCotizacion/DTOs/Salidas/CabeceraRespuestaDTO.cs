using System.Text.Json;

namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.DTOs.Salidas;

public sealed record CabeceraRespuestaDTO(
    string? NumeroProforma,
    DateOnly? FechaProforma,
    DateOnly? FechaVencimiento,
    int? DiasCredito,
    string? TipoDocumento,
    string? Moneda,
    string? NombreProveedorPdf,
    string? NombreNegocio,
    string? RazonSocial,
    string? Cedula,
    string? Telefono,
    string? Vendedor,
    decimal? Subtotal,
    decimal? Descuento,
    decimal? Iva,
    decimal? OtrosCargos,
    decimal? Total,
    JsonElement? DatosProveedorOriginal,
    JsonElement? DatosClienteOriginal,
    string? CondicionesPago,
    string? CondicionesEntrega,
    string? Observaciones);
