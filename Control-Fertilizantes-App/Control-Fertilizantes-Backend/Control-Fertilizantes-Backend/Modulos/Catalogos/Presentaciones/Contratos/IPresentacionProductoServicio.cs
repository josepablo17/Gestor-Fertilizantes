using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.DTOs.Salidas;

using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Salidas;

namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.Contratos;

public interface IPresentacionProductoServicio
{
    Task<IEnumerable<PresentacionProductoListarDTO>> ListarAsync(int? idProducto = null, bool soloActivos = false);
    Task<PresentacionProductoListarDTO?> ObtenerPorIdAsync(int id);
    Task<int> InsertarAsync(PresentacionProductoCrearDTO dto);
    Task<bool> ActualizarAsync(PresentacionProductoActualizarDTO dto);
    Task<bool> DesactivarAsync(int id);
    Task<IEnumerable<ProductoDropdownDTO>> ListarProductosParaDropdownAsync();
    Task<IEnumerable<UnidadMedidaDropdownDTO>> ListarUnidadesMedidaParaDropdownAsync();}
