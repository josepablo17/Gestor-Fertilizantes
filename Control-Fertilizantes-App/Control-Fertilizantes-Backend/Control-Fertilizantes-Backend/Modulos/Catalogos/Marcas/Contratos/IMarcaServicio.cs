using Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.DTOs.Entradas;


namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.Contratos;

public interface IMarcaServicio
{
    Task<IEnumerable<MarcaListarDTO>> ListarAsync(bool soloActivos = false, string? buscar = null);
    Task<MarcaListarDTO?> ObtenerPorIdAsync(int id);
    Task<int> InsertarAsync(MarcaCrearDTO dto);
    Task<bool> ActualizarAsync(MarcaActualizarDTO dto);
    Task<bool> CambiarActivoAsync(int id, CambiarEstadoCatalogoDTO dto);
}
