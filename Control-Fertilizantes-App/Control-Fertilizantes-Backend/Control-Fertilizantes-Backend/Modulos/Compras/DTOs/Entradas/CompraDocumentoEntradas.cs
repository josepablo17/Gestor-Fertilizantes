using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Control_Fertilizantes_Backend.Comun.Validacion;
using Control_Fertilizantes_Backend.Modulos.Presupuestos.DTOs.Entradas;

namespace Control_Fertilizantes_Backend.Modulos.Compras.DTOs.Entradas;

public class CabeceraCompraEntradaDTO
{
    [Range(1, int.MaxValue)] public int IdProveedor { get; init; }
    public DateOnly FechaCompra { get; init; }
    [Required, RegularExpression("CRC|USD")] public string Moneda { get; init; } = string.Empty;
    [StringLength(100)] public string? NumeroFactura { get; init; }
    [StringLength(500)] public string? Observaciones { get; init; }
}

public sealed class CompraDocumentoCrearDTO : CabeceraCompraEntradaDTO
{
    public Guid IdOperacion { get; init; }
    [Required, MinLength(1), MaxLength(100)] public CompraRenglonCrearDTO[] Lineas { get; init; } = [];
}

public class CompraRenglonEntradaDTO
{
    [Range(1, int.MaxValue)] public int IdProducto { get; init; }
    [Range(1, int.MaxValue)] public int IdPresentacionProducto { get; init; }
    [DecimalSql(14, 0), JsonConverter(typeof(DecimalCatalogoJsonConverter))]
    public decimal CantidadComprada { get; init; }
    [DecimalSql(18, 4), JsonConverter(typeof(DecimalCatalogoJsonConverter))]
    public decimal PrecioTotal { get; init; }
    [StringLength(500)] public string? Observaciones { get; init; }
}

public sealed class CompraRenglonCrearDTO : CompraRenglonEntradaDTO
{
    public ImputacionCompraDTO? ImputacionPresupuesto { get; init; }
}

public sealed class CompraCabeceraActualizarDTO : CabeceraCompraEntradaDTO
{
    [Required] public byte[] Version { get; init; } = [];
}

public sealed class CompraRenglonActualizarDTO : CompraRenglonEntradaDTO
{
    [Required] public byte[] Version { get; init; } = [];
}
