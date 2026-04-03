using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Entities;

namespace Control_Fertilizantes_Backend.Interfaces
{
    public interface IPresentacionProductoRepositorio
    {
        Task<IEnumerable<PresentacionProducto>> ListarAsync();
        Task<PresentacionProducto?> ObtenerPorIdAsync(int idPresentacionProducto);
        Task<int> InsertarAsync(PresentacionProducto presentacionProducto);
        Task<bool> ActualizarAsync(PresentacionProducto presentacionProducto);
        Task<bool> DesactivarAsync(int idPresentacionProducto);

        Task<IEnumerable<ProductoDropdownDTO>> ListarProductosParaDropdownAsync();
        Task<IEnumerable<UnidadMedidaDropdownDTO>> ListarUnidadesMedidaParaDropdownAsync();
    }
}
