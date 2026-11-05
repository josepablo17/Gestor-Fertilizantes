using Control_Fertilizantes_Backend.Configuracion;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.Controladores;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GestorFertilizantes.Backend.Tests;

public class OrganizacionPruebas
{
    [Fact]
    public void Los_controladores_de_todos_los_modulos_resuelven_sus_dependencias_sin_abrir_sql()
    {
        var configuracion = new ConfigurationBuilder().AddInMemoryCollection(
            new Dictionary<string, string?>
            {
                ["ConnectionStrings:ConexionSql"] =
                    "Server=127.0.0.1,1;Database=SinConexion;Integrated Security=True;Encrypt=True;Connect Timeout=1"
            }).Build();
        var servicios = new ServiceCollection();
        servicios.AddSingleton<IConfiguration>(configuracion);
        servicios.AddLogging();
        servicios.AgregarBackend();
        using var proveedor = servicios.BuildServiceProvider(new ServiceProviderOptions
        {
            ValidateOnBuild = true,
            ValidateScopes = true
        });
        using var alcance = proveedor.CreateScope();
        var controladores = typeof(ProductoController).Assembly.GetTypes()
            .Where(tipo => !tipo.IsAbstract && typeof(ControllerBase).IsAssignableFrom(tipo))
            .ToArray();
        Assert.NotEmpty(controladores);
        foreach (var tipo in controladores)
        {
            var controlador = ActivatorUtilities.CreateInstance(alcance.ServiceProvider, tipo);
            Assert.IsAssignableFrom<ControllerBase>(controlador);
        }
    }
}
