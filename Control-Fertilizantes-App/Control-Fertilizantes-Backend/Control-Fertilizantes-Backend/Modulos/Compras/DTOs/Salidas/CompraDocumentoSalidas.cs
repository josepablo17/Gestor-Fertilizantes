namespace Control_Fertilizantes_Backend.Modulos.Compras.DTOs.Salidas;

public class CompraDocumentoResumenDTO
{
    public long IdCompraCabecera { get; set; }
    public string NumeroCompra => $"COM-{IdCompraCabecera:D6}";
    public int IdProveedor { get; set; }
    public string NombreProveedor { get; set; } = string.Empty;
    public DateTime FechaCompra { get; set; }
    public string Moneda { get; set; } = string.Empty;
    public string? NumeroFactura { get; set; }
    public string? Observaciones { get; set; }
    public int CantidadProductos { get; set; }
    public decimal Total { get; set; }
}

public sealed class CompraDocumentoDTO : CompraDocumentoResumenDTO
{
    public byte[] Version { get; set; } = [];
    public IReadOnlyList<CompraRenglonDTO> Lineas { get; set; } = [];
}

public sealed class CompraRenglonDTO
{
    public long IdCompra { get; set; }
    public int NumeroLinea { get; set; }
    public int IdProducto { get; set; }
    public string NombreProducto { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public int IdPresentacionProducto { get; set; }
    public string Presentacion { get; set; } = string.Empty;
    public decimal CantidadPresentacion { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;
    public decimal CantidadComprada { get; set; }
    public decimal PrecioTotal { get; set; }
    public decimal PrecioUnitarioCalculado { get; set; }
    public string? Observaciones { get; set; }
}

public record ComprasDocumentoPaginaDTO(long TotalRegistros, IReadOnlyList<CompraDocumentoResumenDTO> Elementos);
