using Control_Fertilizantes_Backend.Entities;

namespace Control_Fertilizantes_Backend.Interfaces
{
    public interface IProveedorRepositorio
    {
        Task<IEnumerable<Proveedor>> ListarAsync();
        Task<Proveedor?> ObtenerPorIdAsync(int idProveedor);
        Task<int> InsertarAsync(Proveedor proveedor);
        Task<bool> ActualizarAsync(Proveedor proveedor);
        Task<bool> DesactivarAsync(int idProveedor);
    }
}
