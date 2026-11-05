using Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.Modelos;
using Control_Fertilizantes_Backend.Comun.Validacion;
using Control_Fertilizantes_Backend.Modulos.Catalogos.DTOs.Entradas;


namespace Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.Servicios;

public class ProductoBaseServicio(IProductoBaseRepositorio repositorio) : IProductoBaseServicio
{
    public async Task<IEnumerable<ProductoBaseListarDTO>> ListarAsync(bool soloActivos = false, string? buscar = null)
    {
        buscar = ValidacionCatalogo.Busqueda(buscar);
        return (await repositorio.ListarAsync(soloActivos, buscar)).Select(Mapear);
    }

    public async Task<ProductoBaseListarDTO?> ObtenerPorIdAsync(int id)
    {
        ValidacionCatalogo.Id(id);
        var datos = await repositorio.ObtenerPorIdAsync(id);
        return datos is null ? null : Mapear(datos);
    }

    public Task<int> InsertarAsync(ProductoBaseCrearDTO dto)
    {
        ValidacionCatalogo.Validar(dto);
        return repositorio.InsertarAsync(new ProductoBaseGuardar
        {
            Codigo = dto.Codigo.Trim(),
            Nombre = dto.Nombre.Trim(),
            FormulaDeclarada = ValidacionCatalogo.Opcional(dto.FormulaDeclarada),
            Descripcion = ValidacionCatalogo.Opcional(dto.Descripcion),
            ComparabilidadRevisada = dto.ComparabilidadRevisada,
        });
    }

    public Task<bool> ActualizarAsync(ProductoBaseActualizarDTO dto)
    {
        ValidacionCatalogo.Validar(dto);
        return repositorio.ActualizarAsync(new ProductoBaseGuardar
        {
            IdProductoBase = dto.IdProductoBase,
            Codigo = dto.Codigo.Trim(),
            Nombre = dto.Nombre.Trim(),
            FormulaDeclarada = ValidacionCatalogo.Opcional(dto.FormulaDeclarada),
            Descripcion = ValidacionCatalogo.Opcional(dto.Descripcion),
            ComparabilidadRevisada = dto.ComparabilidadRevisada,
        });
    }

    public Task<bool> CambiarActivoAsync(int id, CambiarEstadoCatalogoDTO dto)
    {
        ValidacionCatalogo.Id(id);
        ValidacionCatalogo.Validar(dto);
        return repositorio.CambiarActivoAsync(id, dto.Activo ?? throw new InvalidOperationException());
    }

    private static ProductoBaseListarDTO Mapear(ProductoBase datos) => new()
    {
        IdProductoBase = datos.IdProductoBase,
        Codigo = datos.Codigo,
        Nombre = datos.Nombre,
        FormulaDeclarada = datos.FormulaDeclarada,
        Descripcion = datos.Descripcion,
        ComparabilidadRevisada = datos.ComparabilidadRevisada,
        Activo = datos.Activo,
        FechaCreacion = datos.FechaCreacion,
        FechaModificacion = datos.FechaModificacion,
    };
}
