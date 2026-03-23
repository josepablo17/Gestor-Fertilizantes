using Control_Fertilizantes_Backend.Entities;

namespace Control_Fertilizantes_Backend.Interfaces
{
    public interface IProductoRepositorio
    {
        Task<IEnumerable<Producto>> ListarAsync();
        Task<Producto?> ObtenerPorIdAsync(int idProducto);
        Task<int> InsertarAsync(Producto producto);
        Task<bool> ActualizarAsync(Producto producto);
        Task<bool> DesactivarAsync(int idProducto);
    }
}
