using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Salidas;
namespace Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.Contratos
{
    public interface IUnidadMedidaServicio
    {
        Task<IEnumerable<UnidadMedidaListarDTO>> ListarAsync();
        Task<UnidadMedidaListarDTO?> ObtenerPorIdAsync(int idUnidadMedida);
        Task<int> InsertarAsync(UnidadMedidaCrearDTO UnidadMedidaCrearDTO);
        Task<bool> ActualizarAsync(UnidadMedidaActualizarDTO unidadMedidaActualizarDTO);
        Task<bool> DesactivarAsync(int idUnidadMedida);
    }
}
