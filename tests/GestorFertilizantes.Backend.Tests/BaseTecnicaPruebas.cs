using Control_Fertilizantes_Backend.Comun.Errores;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia;
using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace GestorFertilizantes.Backend.Tests;

public class BaseTecnicaPruebas
{
    [Theory]
    [InlineData(52000, 400)]
    [InlineData(51201, 400)]
    [InlineData(51202, 400)]
    [InlineData(51203, 400)]
    [InlineData(52004, 404)]
    [InlineData(51204, 404)]
    [InlineData(52009, 409)]
    [InlineData(52010, 409)]
    [InlineData(51200, 409)]
    [InlineData(51205, 409)]
    [InlineData(51206, 409)]
    [InlineData(2601, 409)]
    [InlineData(2627, 409)]
    [InlineData(547, 409)]
    [InlineData(50001, 409)]
    [InlineData(50002, 404)]
    [InlineData(50003, 409)]
    [InlineData(50004, 404)]
    [InlineData(50005, 409)]
    [InlineData(201, 500)]
    [InlineData(229, 500)]
    [InlineData(18456, 500)]
    [InlineData(99999, 500)]
    public void Traduce_codigos_conocidos_y_conserva_fallos_tecnicos(int numero, int esperado)
    {
        Assert.Equal(esperado, (int)TraductorErroresSql.Traducir(numero).Estado);
    }

    public static IEnumerable<object[]> CodigosIntegridad() =>
        Enumerable.Range(51100, 27).Select(numero => new object[] { numero });

    [Theory]
    [MemberData(nameof(CodigosIntegridad))]
    public void Traduce_las_protecciones_del_documento(int numero) =>
        Assert.Equal(HttpStatusCode.Conflict, TraductorErroresSql.Traducir(numero).Estado);

    [Theory]
    [InlineData("")]
    [InlineData("Password=PRIVADO;NoEsUnaClave=1")]
    [InlineData("Server=localhost;Database=master;Integrated Security=True")]
    [InlineData("Server=localhost;Database=Aplicacion;User ID=sa;Password=PRIVADO")]
    [InlineData("Server=localhost;Database=Aplicacion;User ID=api;Password=PRIVADO;Encrypt=False")]
    [InlineData("Server=localhost;Database=Aplicacion;User ID=api")]
    public void Configuracion_invalida_falla_sin_exponer_credenciales(string cadena)
    {
        var resultado = new ValidadorConexionSql().Validate(null, new() { Cadena = cadena });
        Assert.True(resultado.Failed);
        Assert.DoesNotContain("PRIVADO", string.Join(" ", resultado.Failures));
    }

    [Theory]
    [InlineData("Server=localhost,14333;Database=BDComprasFertilizantes;User ID=gestor_api;Password=SoloPrueba;Encrypt=True;TrustServerCertificate=True")]
    [InlineData("Server=localhost;Database=Aplicacion;Integrated Security=True;Encrypt=True")]
    public void Configuracion_explicita_valida_es_aceptada(string cadena) =>
        Assert.True(new ValidadorConexionSql().Validate(null, new() { Cadena = cadena }).Succeeded);

    [Fact]
    public async Task Error_interno_no_expone_mensaje_ni_datos_del_servidor()
    {
        using var servicios = new ServiceCollection().AddLogging().BuildServiceProvider();
        var contexto = new DefaultHttpContext { RequestServices = servicios };
        await using var cuerpo = new MemoryStream();
        contexto.Response.Body = cuerpo;
        var middleware = new ManejoGlobalExcepcionesMiddleware(
            _ => throw new InvalidOperationException("Password=PRIVADO; dbo.TablaInterna"),
            NullLogger<ManejoGlobalExcepcionesMiddleware>.Instance);
        await middleware.InvokeAsync(contexto);
        Assert.Equal(500, contexto.Response.StatusCode);
        cuerpo.Position = 0;
        using var json = await JsonDocument.ParseAsync(cuerpo);
        Assert.False(json.RootElement.GetProperty("exito").GetBoolean());
        Assert.DoesNotContain("PRIVADO", json.RootElement.ToString());
        Assert.DoesNotContain("dbo.", json.RootElement.ToString());
    }

    [Fact]
    public async Task Cancelacion_del_cliente_no_se_convierte_en_error_interno()
    {
        using var cancelacion = new CancellationTokenSource();
        cancelacion.Cancel();
        var contexto = new DefaultHttpContext { RequestAborted = cancelacion.Token };
        var middleware = new ManejoGlobalExcepcionesMiddleware(
            _ => Task.FromCanceled(cancelacion.Token),
            NullLogger<ManejoGlobalExcepcionesMiddleware>.Instance);
        await middleware.InvokeAsync(contexto);
        Assert.Equal(200, contexto.Response.StatusCode);
    }
}
