using Control_Fertilizantes_Backend.Modulos.Presupuestos.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Presupuestos.DTOs.Salidas;

namespace Control_Fertilizantes_Backend.Modulos.Presupuestos.Contratos;

public interface IPresupuestoRepositorio
{
    Task<IReadOnlyList<PresupuestoResumenDTO>> Listar(int? idFinca, string? moneda, string? estado, CancellationToken ct);
    Task<PresupuestoDetalleDTO> Consultar(long id, CancellationToken ct);
    Task<CatalogosPresupuestoDTO> Catalogos(CancellationToken ct);
    Task<int> CrearFinca(CatalogoPresupuestoDTO datos, CancellationToken ct);
    Task<int> CrearRubro(CatalogoPresupuestoDTO datos, CancellationToken ct);
    Task<long> Crear(CrearPresupuestoDTO datos, CancellationToken ct);
    Task EditarBorrador(long id, EditarBorradorPresupuestoDTO datos, CancellationToken ct);
    Task EstablecerMonto(long id, EstablecerMontoPartidaDTO datos, CancellationToken ct);
    Task Aprobar(long id, OperacionPresupuestoDTO datos, CancellationToken ct);
    Task Cerrar(long id, OperacionPresupuestoDTO datos, CancellationToken ct);
    Task Ajustar(long id, AjustarPartidaDTO datos, CancellationToken ct);
    Task<long> RegistrarCompromiso(RegistrarCompromisoDTO datos, CancellationToken ct);
    Task FinalizarCompromiso(long id, FinalizarCompromisoDTO datos, CancellationToken ct);
    Task<OpcionesImputacionDTO> Opciones(DateOnly fecha, string moneda, int? idProducto, int? idPresentacionProducto,
        int? idProveedor, CancellationToken ct);
    Task<IReadOnlyList<ImputacionActivaDTO>> ConsultarCompra(long id, CancellationToken ct);
    Task ImputarCompra(long id, ImputacionCompraDTO datos, CancellationToken ct);
    Task RevertirCompra(long id, OperacionPresupuestoDTO datos, CancellationToken ct);
}
