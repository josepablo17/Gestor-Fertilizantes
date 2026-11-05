using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.Modelos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Salidas;
namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.Contratos
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
