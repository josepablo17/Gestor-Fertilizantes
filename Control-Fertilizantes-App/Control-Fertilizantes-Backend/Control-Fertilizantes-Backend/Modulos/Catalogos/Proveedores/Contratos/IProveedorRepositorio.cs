using Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.Modelos;
namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.Contratos
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
