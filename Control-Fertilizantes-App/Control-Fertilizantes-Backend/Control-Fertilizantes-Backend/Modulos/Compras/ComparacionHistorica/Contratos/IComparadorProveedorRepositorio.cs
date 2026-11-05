using Control_Fertilizantes_Backend.Modulos.Compras.ComparacionHistorica.DTOs.Salidas;
namespace Control_Fertilizantes_Backend.Modulos.Compras.ComparacionHistorica.Contratos
{
    public interface IComparadorProveedorRepositorio
    {
        Task<IEnumerable<ComparadorProveedorItemDTO>> ObtenerComparativaAsync(
            int idProducto,
            int idPresentacionProducto,
            string? moneda,
            int? mesesAnalisis,
            bool soloAutorizados);

        Task<IEnumerable<ComparadorProveedorDetalleDTO>> ObtenerDetalleHistoricoProveedorAsync(
            int idProducto,
            int idPresentacionProducto,
            int idProveedor,
            string? moneda,
            int? mesesAnalisis);
    }
}