using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.Modelos;
using Control_Fertilizantes_Backend.Comun.Validacion;

using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Salidas;

namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.Servicios;

public class PresentacionProductoServicio(IPresentacionProductoRepositorio repositorio) : IPresentacionProductoServicio
{
    public async Task<IEnumerable<PresentacionProductoListarDTO>> ListarAsync(int? idProducto = null, bool soloActivos = false)
    {
        ValidacionCatalogo.IdOpcional(idProducto);
        return (await repositorio.ListarAsync(idProducto, soloActivos)).Select(Mapear);
    }

    public async Task<PresentacionProductoListarDTO?> ObtenerPorIdAsync(int id)
    {
        ValidacionCatalogo.Id(id);
        var datos = await repositorio.ObtenerPorIdAsync(id);
        return datos is null ? null : Mapear(datos);
    }

    public Task<int> InsertarAsync(PresentacionProductoCrearDTO dto)
    {
        ValidacionCatalogo.Validar(dto);
        return repositorio.InsertarAsync(new PresentacionProductoGuardar
        {
            IdProducto = dto.IdProducto,
            Descripcion = dto.Descripcion.Trim(),
            Cantidad = dto.Cantidad,
            IdUnidadMedida = dto.IdUnidadMedida,
        });
    }

    public Task<bool> ActualizarAsync(PresentacionProductoActualizarDTO dto)
    {
        ValidacionCatalogo.Validar(dto);
        return repositorio.ActualizarAsync(new PresentacionProductoGuardar
        {
            IdPresentacionProducto = dto.IdPresentacionProducto,
            IdProducto = dto.IdProducto,
            Descripcion = dto.Descripcion.Trim(),
            Cantidad = dto.Cantidad,
            IdUnidadMedida = dto.IdUnidadMedida,
        });
    }

    public Task<bool> DesactivarAsync(int id)
    {
        ValidacionCatalogo.Id(id);
        return repositorio.DesactivarAsync(id);
    }
    public Task<IEnumerable<ProductoDropdownDTO>> ListarProductosParaDropdownAsync() => repositorio.ListarProductosParaDropdownAsync();
    public Task<IEnumerable<UnidadMedidaDropdownDTO>> ListarUnidadesMedidaParaDropdownAsync() => repositorio.ListarUnidadesMedidaParaDropdownAsync();
    private static PresentacionProductoListarDTO Mapear(PresentacionProducto datos) => new()
    {
        IdPresentacionProducto = datos.IdPresentacionProducto,
        IdProducto = datos.IdProducto,
        Descripcion = datos.Descripcion,
        Cantidad = datos.Cantidad,
        IdUnidadMedida = datos.IdUnidadMedida,
        NombreProducto = datos.NombreProducto,
        IdProductoBase = datos.IdProductoBase,
        IdMarca = datos.IdMarca,
        Marca = datos.Marca,
        CodigoUnidadMedida = datos.CodigoUnidadMedida,
        NombreUnidadMedida = datos.NombreUnidadMedida,
        TipoBase = datos.TipoBase,
        FactorConversion = datos.FactorConversion,
        CantidadNormalizada = datos.CantidadNormalizada,
        Activo = datos.Activo,
        FechaCreacion = datos.FechaCreacion,
        FechaModificacion = datos.FechaModificacion,
    };
}
