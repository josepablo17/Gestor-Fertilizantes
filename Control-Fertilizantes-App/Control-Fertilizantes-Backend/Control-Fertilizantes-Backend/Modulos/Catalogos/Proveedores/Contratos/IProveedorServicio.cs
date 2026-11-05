using Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.DTOs.Salidas;



namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.Contratos;

public interface IProveedorServicio
{
    Task<IEnumerable<ProveedorListarDTO>> ListarAsync(bool soloActivos = false, string? buscar = null);
    Task<ProveedorListarDTO?> ObtenerPorIdAsync(int id);
    Task<int> InsertarAsync(ProveedorCrearDTO dto);
    Task<bool> ActualizarAsync(ProveedorActualizarDTO dto);
    Task<bool> DesactivarAsync(int id);
}
