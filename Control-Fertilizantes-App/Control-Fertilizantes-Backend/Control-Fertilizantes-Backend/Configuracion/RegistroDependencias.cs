using Control_Fertilizantes_Backend.Infraestructura.Pdf;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Catalogos.Presentaciones;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Catalogos.Productos;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Catalogos.Proveedores;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Catalogos.UnidadesMedida;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Compras;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Compras.Analisis;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Compras.ComparacionHistorica;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Importaciones;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Proformas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.Servicios;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.Servicios;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.Servicios;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.Servicios;
using Control_Fertilizantes_Backend.Modulos.Compras.Analisis.Contratos;
using Control_Fertilizantes_Backend.Modulos.Compras.Analisis.Servicios;
using Control_Fertilizantes_Backend.Modulos.Compras.ComparacionHistorica.Contratos;
using Control_Fertilizantes_Backend.Modulos.Compras.ComparacionHistorica.Servicios;
using Control_Fertilizantes_Backend.Modulos.Compras.Contratos;
using Control_Fertilizantes_Backend.Modulos.Compras.Servicios;
using Control_Fertilizantes_Backend.Modulos.Importaciones.Contratos;
using Control_Fertilizantes_Backend.Modulos.Importaciones.Servicios;
using Control_Fertilizantes_Backend.Modulos.Proformas.Contratos;
using Control_Fertilizantes_Backend.Modulos.Proformas.Servicios;
using Microsoft.Extensions.Options;

namespace Control_Fertilizantes_Backend.Configuracion;

public static class RegistroDependencias
{
    public static IServiceCollection AgregarBackend(this IServiceCollection servicios)
    {
        servicios.AddSingleton<IValidateOptions<OpcionesConexionSql>, ValidadorConexionSql>();
        servicios.AddOptions<OpcionesConexionSql>()
            .Configure<IConfiguration>((opciones, configuracion) =>
                opciones.Cadena = configuracion.GetConnectionString("ConexionSql") ?? string.Empty)
            .ValidateOnStart();
        servicios.AddScoped<IConexionBD, ConexionBD>();
        AgregarCatalogos(servicios);
        AgregarCompras(servicios);
        AgregarImportaciones(servicios);
        AgregarProformas(servicios);
        return servicios;
    }

    private static void AgregarCatalogos(IServiceCollection servicios)
    {
        servicios.AddScoped<IProductoRepositorio, ProductoRepositorio>();
        servicios.AddScoped<IProductoServicio, ProductoServicio>();
        servicios.AddScoped<IProveedorRepositorio, ProveedorRepositorio>();
        servicios.AddScoped<IProveedorServicio, ProveedorServicio>();
        servicios.AddScoped<IUnidadMedidaRepositorio, UnidadMedidaRepositorio>();
        servicios.AddScoped<IUnidadMedidaServicio, UnidadMedidaServicio>();
        servicios.AddScoped<IPresentacionProductoRepositorio, PresentacionProductoRepositorio>();
        servicios.AddScoped<IPresentacionProductoServicio, PresentacionProductoServicio>();
    }

    private static void AgregarCompras(IServiceCollection servicios)
    {
        servicios.AddScoped<ICompraRepositorio, CompraRepositorio>();
        servicios.AddScoped<ICompraServicio, CompraServicio>();
        servicios.AddScoped<ICompraInteligenciaRepositorio, CompraInteligenciaRepositorio>();
        servicios.AddScoped<ICompraInteligenciaServicio, CompraInteligenciaServicio>();
        servicios.AddScoped<IComparadorProveedorRepositorio, ComparadorProveedorRepositorio>();
        servicios.AddScoped<IComparadorProveedorServicio, ComparadorProveedorServicio>();
    }

    private static void AgregarImportaciones(IServiceCollection servicios)
    {
        servicios.AddScoped<IProformaPdfServicio, ProformaPdfServicio>();
        servicios.AddScoped<ICompraAutomaticaRepositorio, CompraAutomaticaRepositorio>();
        servicios.AddScoped<ICompraAutomaticaServicio, CompraAutomaticaServicio>();
    }

    private static void AgregarProformas(IServiceCollection servicios)
    {
        servicios.AddScoped<IProformaProveedorRepositorio, ProformaProveedorRepositorio>();
        servicios.AddScoped<IProformaProveedorServicio, ProformaProveedorServicio>();
    }
}
