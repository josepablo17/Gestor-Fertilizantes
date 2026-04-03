using Control_Fertilizantes_Backend.DTOs;

namespace Control_Fertilizantes_Backend.Interfaces
{
    public interface IPresentacionProductoServicio
    {
        Task<IEnumerable<PresentacionProductoListarDTO>> ListarAsync();
        Task<PresentacionProductoListarDTO?> ObtenerPorIdAsync(int idPresentacionProducto);
        Task<int> InsertarAsync(PresentacionProductoCrearDTO presentacionProductoCrearDTO);
        Task<bool> ActualizarAsync(PresentacionProductoActualizarDTO presentacionProductoActualizarDTO);
        Task<bool> DesactivarAsync(int idPresentacionProducto);

        Task<IEnumerable<ProductoDropdownDTO>> ListarProductosParaDropdownAsync();
        Task<IEnumerable<UnidadMedidaDropdownDTO>> ListarUnidadesMedidaParaDropdownAsync();
    }
}
