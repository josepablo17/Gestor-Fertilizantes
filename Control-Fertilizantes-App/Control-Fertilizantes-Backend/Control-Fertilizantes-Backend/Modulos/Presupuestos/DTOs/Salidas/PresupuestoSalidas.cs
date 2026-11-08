namespace Control_Fertilizantes_Backend.Modulos.Presupuestos.DTOs.Salidas;

public record PresupuestoResumenDTO(long IdPresupuesto, string Nombre, int? IdFinca, string? Finca,
    DateTime FechaInicio, DateTime FechaFin, string Moneda, string Estado, decimal MontoInicial,
    decimal Aprobado, decimal Comprometido, decimal Ejecutado, decimal Disponible);

public record PresupuestoCabeceraDTO(long IdPresupuesto, string Nombre, int? IdFinca, string? Finca,
    DateTime FechaInicio, DateTime FechaFin, string Moneda, string Estado, DateTime FechaCreacion,
    DateTime? FechaAprobacion, DateTime? FechaCierre, string? MotivoCierre, Guid Version);

public record PartidaPresupuestoDTO(long IdPartidaPresupuesto, int IdRubroPresupuesto, string Rubro,
    decimal MontoInicial, decimal Aprobado, decimal Comprometido, decimal Ejecutado, decimal Disponible);

public record MovimientoPresupuestoDTO(long IdMovimientoPresupuesto, Guid IdOperacion, long IdPartidaPresupuesto,
    string Tipo, decimal CambioAprobado, decimal CambioComprometido, decimal CambioEjecutado, long? IdCompra,
    long? IdCompromisoDetalle, long? IdMovimientoRevertido, string? MotivoExceso, string Motivo,
    DateTime FechaRegistro, string UsuarioSql);

public record CompromisoPresupuestoDTO(long IdCompromisoCompra, long IdCompromisoDetalle, long IdPartidaPresupuesto,
    int? IdProformaProveedorDetalle, DateTime FechaCompromiso, string Estado, decimal MontoReservado,
    decimal Pendiente, decimal Ejecutado, string? MotivoCierre);

public record PresupuestoDetalleDTO(PresupuestoCabeceraDTO Presupuesto, IReadOnlyList<PartidaPresupuestoDTO> Partidas,
    IReadOnlyList<MovimientoPresupuestoDTO> Movimientos, IReadOnlyList<CompromisoPresupuestoDTO> Compromisos);

public record FincaPresupuestoDTO(int IdFinca, string Codigo, string Nombre, bool Activa);
public record RubroPresupuestoDTO(int IdRubroPresupuesto, string Codigo, string Nombre, bool Activo);
public record CatalogosPresupuestoDTO(IReadOnlyList<FincaPresupuestoDTO> Fincas, IReadOnlyList<RubroPresupuestoDTO> Rubros);

public record OpcionPartidaDTO(long IdPartidaPresupuesto, long IdPresupuesto, string Presupuesto, string? Finca,
    string Rubro, decimal Disponible);

public record OpcionCompromisoDTO(long IdCompromisoDetalle, long IdCompromisoCompra, long IdPartidaPresupuesto,
    decimal Pendiente, DateTime FechaCompromiso, string? Producto, string? Proveedor);

public record OpcionesImputacionDTO(IReadOnlyList<OpcionPartidaDTO> Partidas, IReadOnlyList<OpcionCompromisoDTO> Compromisos);

public record ImputacionActivaDTO(long IdPresupuesto, string Presupuesto, string? Finca, string Rubro,
    string Estado, decimal Monto, long? IdCompromisoDetalle);
