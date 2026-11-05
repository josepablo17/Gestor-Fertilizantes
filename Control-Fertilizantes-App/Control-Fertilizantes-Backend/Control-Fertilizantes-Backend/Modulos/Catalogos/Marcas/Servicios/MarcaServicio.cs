using Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.Modelos;
using Control_Fertilizantes_Backend.Comun.Validacion;
using Control_Fertilizantes_Backend.Modulos.Catalogos.DTOs.Entradas;


namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.Servicios;

public class MarcaServicio(IMarcaRepositorio repositorio) : IMarcaServicio
{
    public async Task<IEnumerable<MarcaListarDTO>> ListarAsync(bool soloActivos = false, string? buscar = null)
    {
        buscar = ValidacionCatalogo.Busqueda(buscar);
        return (await repositorio.ListarAsync(soloActivos, buscar)).Select(Mapear);
    }

    public async Task<MarcaListarDTO?> ObtenerPorIdAsync(int id)
    {
        ValidacionCatalogo.Id(id);
        var datos = await repositorio.ObtenerPorIdAsync(id);
        return datos is null ? null : Mapear(datos);
    }

    public Task<int> InsertarAsync(MarcaCrearDTO dto)
    {
        ValidacionCatalogo.Validar(dto);
        return repositorio.InsertarAsync(new MarcaGuardar
        {
            Nombre = dto.Nombre.Trim(),
        });
    }

    public Task<bool> ActualizarAsync(MarcaActualizarDTO dto)
    {
        ValidacionCatalogo.Validar(dto);
        return repositorio.ActualizarAsync(new MarcaGuardar
        {
            IdMarca = dto.IdMarca,
            Nombre = dto.Nombre.Trim(),
        });
    }

    public Task<bool> CambiarActivoAsync(int id, CambiarEstadoCatalogoDTO dto)
    {
        ValidacionCatalogo.Id(id);
        ValidacionCatalogo.Validar(dto);
        return repositorio.CambiarActivoAsync(id, dto.Activo ?? throw new InvalidOperationException());
    }

    private static MarcaListarDTO Mapear(Marca datos) => new()
    {
        IdMarca = datos.IdMarca,
        Nombre = datos.Nombre,
        Activo = datos.Activo,
        FechaCreacion = datos.FechaCreacion,
        FechaModificacion = datos.FechaModificacion,
    };
}
