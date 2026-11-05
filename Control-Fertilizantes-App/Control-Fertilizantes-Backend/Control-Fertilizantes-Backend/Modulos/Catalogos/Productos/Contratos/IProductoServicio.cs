using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.DTOs.Salidas;



namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.Contratos;

public interface IProductoServicio
{
    Task<IEnumerable<ProductoListarDTO>> ListarAsync(bool soloActivos = false, string? buscar = null, int? idProductoBase = null, int? idMarca = null);
    Task<ProductoListarDTO?> ObtenerPorIdAsync(int id);
    Task<int> InsertarAsync(ProductoCrearDTO dto);
    Task<bool> ActualizarAsync(ProductoActualizarDTO dto);
    Task<bool> DesactivarAsync(int id);
}
