using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.Modelos;


namespace Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.Contratos;

public interface IUnidadMedidaRepositorio
{
    Task<IEnumerable<UnidadMedida>> ListarAsync(bool soloActivos = false);
    Task<UnidadMedida?> ObtenerPorIdAsync(int id);
    Task<int> InsertarAsync(UnidadMedidaGuardar datos);
    Task<bool> ActualizarAsync(UnidadMedidaGuardar datos);
    Task<bool> DesactivarAsync(int id);
}
