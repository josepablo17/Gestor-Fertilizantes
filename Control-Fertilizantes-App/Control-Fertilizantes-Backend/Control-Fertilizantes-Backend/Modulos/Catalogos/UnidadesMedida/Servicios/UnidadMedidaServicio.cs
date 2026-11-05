using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.Modelos;
using Control_Fertilizantes_Backend.Comun.Validacion;



namespace Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.Servicios;

public class UnidadMedidaServicio(IUnidadMedidaRepositorio repositorio) : IUnidadMedidaServicio
{
    public async Task<IEnumerable<UnidadMedidaListarDTO>> ListarAsync(bool soloActivos = false)
    {

        return (await repositorio.ListarAsync(soloActivos)).Select(Mapear);
    }

    public async Task<UnidadMedidaListarDTO?> ObtenerPorIdAsync(int id)
    {
        ValidacionCatalogo.Id(id);
        var datos = await repositorio.ObtenerPorIdAsync(id);
        return datos is null ? null : Mapear(datos);
    }

    public Task<int> InsertarAsync(UnidadMedidaCrearDTO dto)
    {
        ValidacionCatalogo.Validar(dto);
        return repositorio.InsertarAsync(new UnidadMedidaGuardar
        {
            Codigo = dto.Codigo.Trim().ToUpperInvariant(),
            Nombre = dto.Nombre.Trim(),
            TipoBase = dto.TipoBase.Trim().ToUpperInvariant(),
            FactorConversion = dto.FactorConversion,
            EsUnidadBase = dto.EsUnidadBase,
        });
    }

    public Task<bool> ActualizarAsync(UnidadMedidaActualizarDTO dto)
    {
        ValidacionCatalogo.Validar(dto);
        return repositorio.ActualizarAsync(new UnidadMedidaGuardar
        {
            IdUnidadMedida = dto.IdUnidadMedida,
            Codigo = dto.Codigo.Trim().ToUpperInvariant(),
            Nombre = dto.Nombre.Trim(),
            TipoBase = dto.TipoBase.Trim().ToUpperInvariant(),
            FactorConversion = dto.FactorConversion,
            EsUnidadBase = dto.EsUnidadBase,
        });
    }

    public Task<bool> DesactivarAsync(int id)
    {
        ValidacionCatalogo.Id(id);
        return repositorio.DesactivarAsync(id);
    }

    private static UnidadMedidaListarDTO Mapear(UnidadMedida datos) => new()
    {
        IdUnidadMedida = datos.IdUnidadMedida,
        Codigo = datos.Codigo,
        Nombre = datos.Nombre,
        TipoBase = datos.TipoBase,
        FactorConversion = datos.FactorConversion,
        EsUnidadBase = datos.EsUnidadBase,
        Activo = datos.Activo,
    };
}
