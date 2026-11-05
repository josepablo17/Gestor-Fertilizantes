using Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.Modelos;


namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.Contratos;

public interface IMarcaRepositorio
{
    Task<IEnumerable<Marca>> ListarAsync(bool soloActivos = false, string? buscar = null);
    Task<Marca?> ObtenerPorIdAsync(int id);
    Task<int> InsertarAsync(MarcaGuardar datos);
    Task<bool> ActualizarAsync(MarcaGuardar datos);
    Task<bool> CambiarActivoAsync(int id, bool activo);
}
