using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.Modelos;
using Control_Fertilizantes_Backend.Comun.Validacion;



namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.Servicios;

public class ProductoServicio(IProductoRepositorio repositorio) : IProductoServicio
{
    public async Task<IEnumerable<ProductoListarDTO>> ListarAsync(bool soloActivos = false, string? buscar = null, int? idProductoBase = null, int? idMarca = null)
    {
        buscar = ValidacionCatalogo.Busqueda(buscar);
        ValidacionCatalogo.IdOpcional(idProductoBase);
        ValidacionCatalogo.IdOpcional(idMarca);
        return (await repositorio.ListarAsync(soloActivos, buscar, idProductoBase, idMarca)).Select(Mapear);
    }

    public async Task<ProductoListarDTO?> ObtenerPorIdAsync(int id)
    {
        ValidacionCatalogo.Id(id);
        var datos = await repositorio.ObtenerPorIdAsync(id);
        return datos is null ? null : Mapear(datos);
    }

    public Task<int> InsertarAsync(ProductoCrearDTO dto)
    {
        ValidacionCatalogo.Validar(dto);
        return repositorio.InsertarAsync(new ProductoGuardar
        {
            Nombre = dto.Nombre.Trim(),
            IdProductoBase = dto.IdProductoBase,
            IdMarca = dto.IdMarca,
            Categoria = ValidacionCatalogo.Opcional(dto.Categoria),
            Descripcion = ValidacionCatalogo.Opcional(dto.Descripcion),
            CodigoInterno = ValidacionCatalogo.Opcional(dto.CodigoInterno),
        });
    }

    public Task<bool> ActualizarAsync(ProductoActualizarDTO dto)
    {
        ValidacionCatalogo.Validar(dto);
        return repositorio.ActualizarAsync(new ProductoGuardar
        {
            IdProducto = dto.IdProducto,
            Nombre = dto.Nombre.Trim(),
            IdProductoBase = dto.IdProductoBase,
            IdMarca = dto.IdMarca,
            Categoria = ValidacionCatalogo.Opcional(dto.Categoria),
            Descripcion = ValidacionCatalogo.Opcional(dto.Descripcion),
            CodigoInterno = ValidacionCatalogo.Opcional(dto.CodigoInterno),
        });
    }

    public Task<bool> DesactivarAsync(int id)
    {
        ValidacionCatalogo.Id(id);
        return repositorio.DesactivarAsync(id);
    }

    private static ProductoListarDTO Mapear(Producto datos) => new()
    {
        IdProducto = datos.IdProducto,
        Nombre = datos.Nombre,
        IdProductoBase = datos.IdProductoBase,
        IdMarca = datos.IdMarca,
        Categoria = datos.Categoria,
        Descripcion = datos.Descripcion,
        CodigoInterno = datos.CodigoInterno,
        CodigoProductoBase = datos.CodigoProductoBase,
        NombreProductoBase = datos.NombreProductoBase,
        FormulaDeclarada = datos.FormulaDeclarada,
        ComparabilidadRevisada = datos.ComparabilidadRevisada,
        Marca = datos.Marca,
        Activo = datos.Activo,
        FechaCreacion = datos.FechaCreacion,
        FechaModificacion = datos.FechaModificacion,
    };
}
