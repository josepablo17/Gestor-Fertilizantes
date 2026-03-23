using Control_Fertilizantes_Backend.DTOs;

namespace Control_Fertilizantes_Backend.Interfaces
{
    public interface IProductoServicio
    {
        Task<IEnumerable<ProductoListarDTO>> ListarAsync();
        Task<ProductoListarDTO?> ObtenerPorIdAsync(int idProducto);
        Task<int> InsertarAsync(ProductoCrearDTO productoCrearDTO);
        Task<bool> ActualizarAsync(ProductoActualizarDTO productoActualizarDTO);
        Task<bool> DesactivarAsync(int idProducto);
    }
}
