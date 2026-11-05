using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Salidas;



namespace Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.Contratos;

public interface IUnidadMedidaServicio
{
    Task<IEnumerable<UnidadMedidaListarDTO>> ListarAsync(bool soloActivos = false);
    Task<UnidadMedidaListarDTO?> ObtenerPorIdAsync(int id);
    Task<int> InsertarAsync(UnidadMedidaCrearDTO dto);
    Task<bool> ActualizarAsync(UnidadMedidaActualizarDTO dto);
    Task<bool> DesactivarAsync(int id);
}
