using Control_Fertilizantes_Backend.DTOs;

namespace Control_Fertilizantes_Backend.Interfaces
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