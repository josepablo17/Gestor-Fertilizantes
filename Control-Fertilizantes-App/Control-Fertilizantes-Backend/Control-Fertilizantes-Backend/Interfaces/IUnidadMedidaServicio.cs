using Control_Fertilizantes_Backend.DTOs;

namespace Control_Fertilizantes_Backend.Interfaces
{
    public interface IUnidadMedidaServicio
    {
        Task<IEnumerable<UnidadMedidaListarDTO>> ListarAsync();
        Task<UnidadMedidaListarDTO> ObtenerPorIdAsync(int idUnidadMedida);
        Task<int> InsertarAsync(UnidadMedidaCrearDTO UnidadMedidaCrearDTO);
        Task<bool> ActualizarAsync(UnidadMedidaActualizarDTO unidadMedidaActualizarDTO);
        Task<bool> DesactivarAsync(int idUnidadMedida);
    }
}
