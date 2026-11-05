using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.Modelos;
namespace Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.Contratos
{
    public interface IUnidadMedidaRepositorio
    {
        Task<IEnumerable<UnidadMedida>> ListarAsync();
        Task<UnidadMedida?> ObtenerPorIdAsync(int idUnidadMedida);
        Task<int> InsertarAsync(UnidadMedida unidadMedida);
        Task<bool> ActualizarAsync(UnidadMedida unidadMedida);
        Task<bool> DesactivarAsync(int idUnidadMedida);
    }
}
