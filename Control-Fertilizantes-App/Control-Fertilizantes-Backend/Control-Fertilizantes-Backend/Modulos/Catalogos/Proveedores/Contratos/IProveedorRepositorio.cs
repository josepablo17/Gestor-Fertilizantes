using Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.Modelos;


namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.Contratos;

public interface IProveedorRepositorio
{
    Task<IEnumerable<Proveedor>> ListarAsync(bool soloActivos = false, string? buscar = null);
    Task<Proveedor?> ObtenerPorIdAsync(int id);
    Task<int> InsertarAsync(ProveedorGuardar datos);
    Task<bool> ActualizarAsync(ProveedorGuardar datos);
    Task<bool> DesactivarAsync(int id);
}
