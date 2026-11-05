using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.Modelos;
namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.Contratos
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
