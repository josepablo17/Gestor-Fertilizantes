using Control_Fertilizantes_Backend.Modulos.Compras.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Compras.DTOs.Salidas;
namespace Control_Fertilizantes_Backend.Modulos.Compras.Contratos
{
    public interface ICompraServicio
    {
        Task<IEnumerable<CompraListarDTO>> ListarAsync();
        Task<CompraDetalleDTO?> ObtenerPorIdAsync(int idCompra);
        Task<int> InsertarAsync(CompraCrearDTO compraCrearDTO);
        Task<bool> ActualizarAsync(CompraActualizarDTO compraActualizarDTO);
        Task<IEnumerable<CompraListarDTO>> HistorialPorProductoAsync(int idProducto);
        Task<UltimoPrecioCompraDTO?> ObtenerUltimoPrecioAsync(int idProducto, int idPresentacionProducto);
    }
}
