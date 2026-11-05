using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Salidas;
namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.Contratos
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
