using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Control_Fertilizantes_Backend.Comun.Validacion;

namespace Control_Fertilizantes_Backend.Modulos.Presupuestos.DTOs.Entradas;

public sealed class EditarBorradorPresupuestoDTO
{
    public Guid IdOperacion { get; init; }
    public Guid Version { get; init; }
    [Required, StringLength(150)] public string Nombre { get; init; } = string.Empty;
    public int? IdFinca { get; init; }
    public DateOnly FechaInicio { get; init; }
    public DateOnly FechaFin { get; init; }
    [Required, RegularExpression("CRC|USD")] public string Moneda { get; init; } = string.Empty;
    [Required, MinLength(1), MaxLength(100)] public PartidaBorradorDTO[] Partidas { get; init; } = [];
}

public sealed class PartidaBorradorDTO
{
    [Range(1, int.MaxValue)] public int IdRubroPresupuesto { get; init; }
    [DecimalSql(18, 4), JsonConverter(typeof(DecimalCatalogoJsonConverter))] public decimal Monto { get; init; }
}

public sealed class EstablecerMontoPartidaDTO : OperacionPresupuestoDTO
{
    [Required, DecimalOferta(18, 4), JsonConverter(typeof(DecimalOfertaJsonConverter))]
    public decimal? NuevoMonto { get; init; }
    [Required, DecimalOferta(28, 4), JsonConverter(typeof(DecimalOfertaJsonConverter))]
    public decimal? MontoAprobadoEsperado { get; init; }
}
