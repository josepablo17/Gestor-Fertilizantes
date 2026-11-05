using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.Modelos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Salidas;

namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.Contratos;

public interface IPresentacionProductoRepositorio
{
    Task<IEnumerable<PresentacionProducto>> ListarAsync(int? idProducto = null, bool soloActivos = false);
    Task<PresentacionProducto?> ObtenerPorIdAsync(int id);
    Task<int> InsertarAsync(PresentacionProductoGuardar datos);
    Task<bool> ActualizarAsync(PresentacionProductoGuardar datos);
    Task<bool> DesactivarAsync(int id);
    Task<IEnumerable<ProductoDropdownDTO>> ListarProductosParaDropdownAsync();
    Task<IEnumerable<UnidadMedidaDropdownDTO>> ListarUnidadesMedidaParaDropdownAsync();}
