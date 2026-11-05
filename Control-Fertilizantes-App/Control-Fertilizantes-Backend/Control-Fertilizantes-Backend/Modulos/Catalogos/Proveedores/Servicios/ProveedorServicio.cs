using Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.Modelos;
using Control_Fertilizantes_Backend.Comun.Validacion;



namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.Servicios;

public class ProveedorServicio(IProveedorRepositorio repositorio) : IProveedorServicio
{
    public async Task<IEnumerable<ProveedorListarDTO>> ListarAsync(bool soloActivos = false, string? buscar = null)
    {
        buscar = ValidacionCatalogo.Busqueda(buscar);
        return (await repositorio.ListarAsync(soloActivos, buscar)).Select(Mapear);
    }

    public async Task<ProveedorListarDTO?> ObtenerPorIdAsync(int id)
    {
        ValidacionCatalogo.Id(id);
        var datos = await repositorio.ObtenerPorIdAsync(id);
        return datos is null ? null : Mapear(datos);
    }

    public Task<int> InsertarAsync(ProveedorCrearDTO dto)
    {
        ValidacionCatalogo.Validar(dto);
        return repositorio.InsertarAsync(new ProveedorGuardar
        {
            Nombre = dto.Nombre.Trim(),
            Contacto = ValidacionCatalogo.Opcional(dto.Contacto),
            Telefono = ValidacionCatalogo.Opcional(dto.Telefono),
            Correo = ValidacionCatalogo.Opcional(dto.Correo),
            Direccion = ValidacionCatalogo.Opcional(dto.Direccion),
            Provincia = ValidacionCatalogo.Opcional(dto.Provincia),
            Canton = ValidacionCatalogo.Opcional(dto.Canton),
            Distrito = ValidacionCatalogo.Opcional(dto.Distrito),
            FuenteExterna = ValidacionCatalogo.Opcional(dto.FuenteExterna),
            IdExterno = ValidacionCatalogo.Opcional(dto.IdExterno),
            TipoIdentificacion = ValidacionCatalogo.Opcional(dto.TipoIdentificacion),
            IdentificacionFiscal = ValidacionCatalogo.Opcional(dto.IdentificacionFiscal),
            PaisIdentificacion = ValidacionCatalogo.Opcional(dto.PaisIdentificacion),
            EsProveedorAutorizado = dto.EsProveedorAutorizado,
            FechaUltimaSincronizacion = dto.FechaUltimaSincronizacion,
        });
    }

    public Task<bool> ActualizarAsync(ProveedorActualizarDTO dto)
    {
        ValidacionCatalogo.Validar(dto);
        return repositorio.ActualizarAsync(new ProveedorGuardar
        {
            IdProveedor = dto.IdProveedor,
            Nombre = dto.Nombre.Trim(),
            Contacto = ValidacionCatalogo.Opcional(dto.Contacto),
            Telefono = ValidacionCatalogo.Opcional(dto.Telefono),
            Correo = ValidacionCatalogo.Opcional(dto.Correo),
            Direccion = ValidacionCatalogo.Opcional(dto.Direccion),
            Provincia = ValidacionCatalogo.Opcional(dto.Provincia),
            Canton = ValidacionCatalogo.Opcional(dto.Canton),
            Distrito = ValidacionCatalogo.Opcional(dto.Distrito),
            FuenteExterna = ValidacionCatalogo.Opcional(dto.FuenteExterna),
            IdExterno = ValidacionCatalogo.Opcional(dto.IdExterno),
            TipoIdentificacion = ValidacionCatalogo.Opcional(dto.TipoIdentificacion),
            IdentificacionFiscal = ValidacionCatalogo.Opcional(dto.IdentificacionFiscal),
            PaisIdentificacion = ValidacionCatalogo.Opcional(dto.PaisIdentificacion),
            EsProveedorAutorizado = dto.EsProveedorAutorizado,
            FechaUltimaSincronizacion = dto.FechaUltimaSincronizacion,
        });
    }

    public Task<bool> DesactivarAsync(int id)
    {
        ValidacionCatalogo.Id(id);
        return repositorio.DesactivarAsync(id);
    }

    private static ProveedorListarDTO Mapear(Proveedor datos) => new()
    {
        IdProveedor = datos.IdProveedor,
        Nombre = datos.Nombre,
        Contacto = datos.Contacto,
        Telefono = datos.Telefono,
        Correo = datos.Correo,
        Direccion = datos.Direccion,
        Provincia = datos.Provincia,
        Canton = datos.Canton,
        Distrito = datos.Distrito,
        FuenteExterna = datos.FuenteExterna,
        IdExterno = datos.IdExterno,
        TipoIdentificacion = datos.TipoIdentificacion,
        IdentificacionFiscal = datos.IdentificacionFiscal,
        PaisIdentificacion = datos.PaisIdentificacion,
        EsProveedorAutorizado = datos.EsProveedorAutorizado,
        FechaUltimaSincronizacion = datos.FechaUltimaSincronizacion,
        Activo = datos.Activo,
        FechaCreacion = datos.FechaCreacion,
        FechaModificacion = datos.FechaModificacion,
    };
}
