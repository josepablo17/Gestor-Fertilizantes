using System.ComponentModel.DataAnnotations;

namespace Control_Fertilizantes_Backend.Modulos.Presupuestos.DTOs.Entradas;

public class OperacionPresupuestoDTO
{
    public Guid IdOperacion { get; init; }

    [Required, StringLength(500)]
    public string Motivo { get; init; } = string.Empty;
}

public sealed class CatalogoPresupuestoDTO
{
    [Required, StringLength(30)]
    public string Codigo { get; init; } = string.Empty;

    [Required, StringLength(150)]
    public string Nombre { get; init; } = string.Empty;
}

public record PartidaInicialDTO(int IdRubroPresupuesto, decimal Monto);
public record ReservaPartidaDTO(long IdPartidaPresupuesto, decimal Monto, int? IdProformaProveedorDetalle);
public record ImputacionPartidaDTO(long IdPartidaPresupuesto, decimal Monto, long? IdCompromisoDetalle);

public sealed class CrearPresupuestoDTO : OperacionPresupuestoDTO
{
    [Required, StringLength(150)]
    public string Nombre { get; init; } = string.Empty;

    public DateOnly FechaInicio { get; init; }
    public DateOnly FechaFin { get; init; }

    [Required, RegularExpression("CRC|USD")]
    public string Moneda { get; init; } = string.Empty;

    public int? IdFinca { get; init; }

    [Required, MinLength(1), MaxLength(100)]
    public PartidaInicialDTO[] Partidas { get; init; } = [];
}

public sealed class AjustarPartidaDTO : OperacionPresupuestoDTO
{
    public decimal Ajuste { get; init; }
}

public sealed class RegistrarCompromisoDTO : OperacionPresupuestoDTO
{
    public DateOnly FechaCompromiso { get; init; }

    [Required, RegularExpression("CRC|USD")]
    public string Moneda { get; init; } = string.Empty;

    public long? IdSolicitudCotizacion { get; init; }

    [Required, MinLength(1), MaxLength(100)]
    public ReservaPartidaDTO[] Distribucion { get; init; } = [];
}

public sealed class FinalizarCompromisoDTO : OperacionPresupuestoDTO
{
    [Required, RegularExpression("Cerrado|Cancelado")]
    public string Estado { get; init; } = string.Empty;
}

public sealed class ImputacionCompraDTO : OperacionPresupuestoDTO
{
    [StringLength(500)]
    public string? MotivoExceso { get; init; }

    [Required, MinLength(1), MaxLength(100)]
    public ImputacionPartidaDTO[] Distribucion { get; init; } = [];
}
