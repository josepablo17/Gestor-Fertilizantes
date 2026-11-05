using Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.DTOs.Entradas;


namespace Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.Contratos;

public interface IProductoBaseServicio
{
    Task<IEnumerable<ProductoBaseListarDTO>> ListarAsync(bool soloActivos = false, string? buscar = null);
    Task<ProductoBaseListarDTO?> ObtenerPorIdAsync(int id);
    Task<int> InsertarAsync(ProductoBaseCrearDTO dto);
    Task<bool> ActualizarAsync(ProductoBaseActualizarDTO dto);
    Task<bool> CambiarActivoAsync(int id, CambiarEstadoCatalogoDTO dto);
}
