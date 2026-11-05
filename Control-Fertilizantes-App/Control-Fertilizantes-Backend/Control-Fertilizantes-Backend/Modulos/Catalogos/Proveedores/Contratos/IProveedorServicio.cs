using Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.DTOs.Salidas;
namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.Contratos
{
    public interface IProveedorServicio
    {
        Task<IEnumerable<ProveedorListarDTO>> ListarAsync();
        Task<ProveedorListarDTO?> ObtenerPorIdAsync(int idProveedor);
        Task<int> InsertarAsync(ProveedorCrearDTO proveedorCrearDTO);
        Task<bool> ActualizarAsync(ProveedorActualizarDTO proveedorActualizarDTO);
        Task<bool> DesactivarAsync(int idProveedor);
    }
}
