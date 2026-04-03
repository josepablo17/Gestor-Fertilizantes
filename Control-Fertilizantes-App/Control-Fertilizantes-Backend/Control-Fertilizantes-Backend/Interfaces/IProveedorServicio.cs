using Control_Fertilizantes_Backend.DTOs;

namespace Control_Fertilizantes_Backend.Interfaces
{
    public interface IProveedorServicio
    {
        Task<IEnumerable<ProveedorListarDTO>> ListarAsync();
        Task<ProveedorListarDTO> ObtenerPorIdAsync(int idProveedor);
        Task<int> InsertarAsync(ProveedorCrearDTO proveedorCrearDTO);
        Task<bool> ActualizarAsync(ProveedorActualizarDTO proveedorActualizarDTO);
        Task<bool> DesactivarAsync(int idProveedor);
    }
}
