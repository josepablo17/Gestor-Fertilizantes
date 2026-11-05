using Control_Fertilizantes_Backend.Modulos.Compras.Modelos;
namespace Control_Fertilizantes_Backend.Modulos.Compras.Contratos
{
    public interface ICompraRepositorio
    {
        Task<IEnumerable<Compra>> ListarAsync();
        Task<Compra?> ObtenerPorIdAsync(int idCompra);
        Task<int> InsertarAsync(Compra compra);
        Task<bool> ActualizarAsync(Compra compra);
        Task<IEnumerable<Compra>> HistorialPorProductoAsync(int idProducto);
        Task<Compra?> ObtenerUltimoPrecioAsync(int idProducto, int idPresentacionProducto);
    }
}
