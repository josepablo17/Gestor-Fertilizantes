using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.Modelos;


namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.Contratos;

public interface IProductoRepositorio
{
    Task<IEnumerable<Producto>> ListarAsync(bool soloActivos = false, string? buscar = null, int? idProductoBase = null, int? idMarca = null);
    Task<Producto?> ObtenerPorIdAsync(int id);
    Task<int> InsertarAsync(ProductoGuardar datos);
    Task<bool> ActualizarAsync(ProductoGuardar datos);
    Task<bool> DesactivarAsync(int id);
}
