using Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.Servicios;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Catalogos.ProductosBase;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.Servicios;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Catalogos.Marcas;
using Control_Fertilizantes_Backend.Infraestructura.Pdf;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Catalogos.Presentaciones;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Catalogos.Productos;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Catalogos.Proveedores;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Catalogos.UnidadesMedida;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Compras;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Presupuestos;
using Control_Fertilizantes_Backend.Modulos.Presupuestos.Contratos;
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
using Control_Fertilizantes_Backend.Modulos.Compras.Contratos;
using Control_Fertilizantes_Backend.Modulos.Compras.Servicios;
using Control_Fertilizantes_Backend.Modulos.Importaciones.Contratos;
using Control_Fertilizantes_Backend.Modulos.Importaciones.Servicios;
using Control_Fertilizantes_Backend.Modulos.Proformas.Contratos;
using Control_Fertilizantes_Backend.Modulos.Proformas.Servicios;
using Microsoft.Extensions.Options;
using Control_Fertilizantes_Backend.Infraestructura.Archivos;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Solicitudes;
using Control_Fertilizantes_Backend.Modulos.Documentos.Contratos;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Contratos;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Servicios;
using Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Contratos;
using Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Servicios;
using Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.Contratos;
using Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.Servicios;

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
        servicios.AddSingleton(TimeProvider.System);
        servicios.AddOptions<OpcionesDocumentos>().BindConfiguration("Documentos")
            .Validate(x => !string.IsNullOrWhiteSpace(x.RutaRaiz), "La carpeta de documentos debe estar configurada.").ValidateOnStart();
        servicios.AddScoped<IAlmacenDocumentos, AlmacenDocumentosLocal>();
        servicios.AddScoped<IGeneradorSolicitudPdf, GeneradorSolicitudPdf>();
        servicios.AddScoped<ISolicitudRepositorio, SolicitudRepositorio>();
        servicios.AddScoped<ISolicitudServicio, SolicitudServicio>();
        servicios.AddScoped<ILectorRespuestaPdf, LectorRespuestaPdf>();
        servicios.AddScoped<IRespuestaCotizacionRepositorio, RespuestaCotizacionRepositorio>();
        servicios.AddScoped<RespuestaCotizacionServicio>();
        servicios.AddScoped<IComparacionCotizacionesRepositorio, ComparacionCotizacionesRepositorio>();
        servicios.AddScoped<ComparacionCotizacionesServicio>();
        return servicios;
    }

    private static void AgregarCatalogos(IServiceCollection servicios)
    {
        servicios.AddScoped<IProductoBaseRepositorio, ProductoBaseRepositorio>();
        servicios.AddScoped<IProductoBaseServicio, ProductoBaseServicio>();
        servicios.AddScoped<IMarcaRepositorio, MarcaRepositorio>();
        servicios.AddScoped<IMarcaServicio, MarcaServicio>();
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
        servicios.AddScoped<IPresupuestoRepositorio, PresupuestoRepositorio>();
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
