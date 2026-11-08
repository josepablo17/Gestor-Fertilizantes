using System.Text.Json;
using Control_Fertilizantes_Backend.Comun.Errores;
using Control_Fertilizantes_Backend.Modulos.Compras.Contratos;
using Control_Fertilizantes_Backend.Modulos.Compras.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Compras.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Compras.Servicios;
using Control_Fertilizantes_Backend.Modulos.Presupuestos.DTOs.Entradas;

namespace GestorFertilizantes.Backend.Tests;

public class ComprasDocumentoPruebas
{
    [Fact]
    public async Task Registra_varios_productos_en_una_sola_operacion()
    {
        var repositorio = new RepositorioPrueba();
        var servicio = new CompraDocumentoServicio(repositorio, TimeProvider.System);
        var datos = Crear(Linea(2, 100), new CompraRenglonCrearDTO { IdProducto = 3, IdPresentacionProducto = 4, CantidadComprada = 3, PrecioTotal = 150 });
        var compra = await servicio.Registrar(datos, default);
        Assert.Equal(1, repositorio.Registros);
        Assert.Same(datos, repositorio.Datos);
        Assert.Equal(12, compra.IdCompraCabecera);
    }

    [Theory]
    [InlineData("0", "100")]
    [InlineData("-1", "100")]
    [InlineData("2.5", "100")]
    [InlineData("2", "0")]
    [InlineData("2", "100.12345")]
    [InlineData("1", "99999999999999")]
    public async Task Un_renglon_invalido_impide_enviar_toda_la_compra_a_persistencia(string cantidad, string importe)
    {
        var repositorio = new RepositorioPrueba();
        var servicio = new CompraDocumentoServicio(repositorio, TimeProvider.System);
        await Assert.ThrowsAsync<ReglaNegocio>(() => servicio.Registrar(Crear(Linea(2, 100),
            Linea(decimal.Parse(cantidad, System.Globalization.CultureInfo.InvariantCulture), decimal.Parse(importe, System.Globalization.CultureInfo.InvariantCulture))), default));
        Assert.Equal(0, repositorio.Registros);
    }

    [Fact]
    public async Task Reparto_presupuestario_debe_coincidir_con_el_renglon()
    {
        var repositorio = new RepositorioPrueba();
        var servicio = new CompraDocumentoServicio(repositorio, TimeProvider.System);
        var linea = new CompraRenglonCrearDTO { IdProducto = 1, IdPresentacionProducto = 2, CantidadComprada = 2, PrecioTotal = 100,
            ImputacionPresupuesto = new ImputacionCompraDTO { Motivo = "Entrega", Distribucion = [new(1, 99, null)] } };
        await Assert.ThrowsAsync<ReglaNegocio>(() => servicio.Registrar(Crear(linea), default));
        Assert.Equal(0, repositorio.Registros);
    }

    [Fact]
    public async Task No_acepta_compra_vacia_o_con_mas_de_cien_productos()
    {
        var repositorio = new RepositorioPrueba();
        var servicio = new CompraDocumentoServicio(repositorio, TimeProvider.System);
        await Assert.ThrowsAsync<ReglaNegocio>(() => servicio.Registrar(Crear(), default));
        await Assert.ThrowsAsync<ReglaNegocio>(() => servicio.Registrar(Crear(Enumerable.Repeat(Linea(2, 100), 101).ToArray()), default));
        Assert.Equal(0, repositorio.Registros);
    }

    [Fact]
    public void Importes_json_no_se_redondean_antes_de_validar()
    {
        Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<CompraRenglonCrearDTO>(
            "{\"precioTotal\":1.00000000000000000000000000001}", new JsonSerializerOptions(JsonSerializerDefaults.Web)));
    }

    private static CompraRenglonCrearDTO Linea(decimal cantidad, decimal importe) =>
        new() { IdProducto = 1, IdPresentacionProducto = 2, CantidadComprada = cantidad, PrecioTotal = importe };

    private static CompraDocumentoCrearDTO Crear(params CompraRenglonCrearDTO[] lineas) =>
        new() { IdOperacion = Guid.NewGuid(), IdProveedor = 7, FechaCompra = new DateOnly(2026, 4, 1), Moneda = "CRC", Lineas = lineas };

    private sealed class RepositorioPrueba : ICompraDocumentoRepositorio
    {
        public int Registros { get; private set; }
        public CompraDocumentoCrearDTO? Datos { get; private set; }
        public Task<long> Registrar(CompraDocumentoCrearDTO datos, CancellationToken ct) { Registros++; Datos = datos; return Task.FromResult(12L); }
        public Task<CompraDocumentoDTO> Obtener(long id, CancellationToken ct) => Task.FromResult(new CompraDocumentoDTO { IdCompraCabecera = id });
        public Task<ComprasDocumentoPaginaDTO> Listar(string? busqueda, string? moneda, DateOnly? fecha, int pagina, int tamanoPagina, CancellationToken ct) => throw new NotSupportedException();
        public Task ActualizarCabecera(long id, CompraCabeceraActualizarDTO datos, CancellationToken ct) => throw new NotSupportedException();
        public Task ActualizarRenglon(long id, long idCompra, CompraRenglonActualizarDTO datos, CancellationToken ct) => throw new NotSupportedException();
    }
}
