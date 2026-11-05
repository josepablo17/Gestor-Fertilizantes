using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.DTOs.Salidas;
namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.Contratos
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
