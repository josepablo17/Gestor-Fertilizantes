using Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.Modelos;


namespace Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.Contratos;

public interface IProductoBaseRepositorio
{
    Task<IEnumerable<ProductoBase>> ListarAsync(bool soloActivos = false, string? buscar = null);
    Task<ProductoBase?> ObtenerPorIdAsync(int id);
    Task<int> InsertarAsync(ProductoBaseGuardar datos);
    Task<bool> ActualizarAsync(ProductoBaseGuardar datos);
    Task<bool> CambiarActivoAsync(int id, bool activo);
}
