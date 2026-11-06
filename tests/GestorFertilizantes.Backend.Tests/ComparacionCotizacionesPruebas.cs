using Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.Contratos;
using Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.Modelos;
using Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.Servicios;

namespace GestorFertilizantes.Backend.Tests;

public class ComparacionCotizacionesPruebas
{
    [Fact]
    public async Task Un_contenido_que_sql_devuelve_como_cero_no_produce_precio_ni_cobertura_ficticios()
    {
        var servicio = new ComparacionCotizacionesServicio(new ComparacionSinPrecision());
        var resultado = await servicio.CompararAsync(1,
            new ComparacionSolicitudConsultaDTO { Moneda = "CRC", BaseTotalLinea = "Bruto", FechaReferencia = "2026-11-05" },
            CancellationToken.None);

        var linea = Assert.Single(resultado.Lineas);
        var oferta = Assert.Single(linea.Ofertas);
        Assert.Equal("PrecioNoRepresentable", oferta.CondicionComparacion);
        Assert.Null(oferta.PrecioPorUnidadBase);
        Assert.Null(linea.MenorPrecioConCoberturaYVigencia);
        Assert.False(oferta.EsComparable);
        Assert.False(oferta.CubreCantidadSolicitada);
        Assert.False(oferta.EsMenorPrecioConCoberturaYVigencia);
    }

    private sealed class ComparacionSinPrecision : IComparacionCotizacionesRepositorio
    {
        public Task<IReadOnlyList<ComparacionFila>> CompararAsync(CriterioComparacion criterio, CancellationToken cancelacion) =>
            Task.FromResult<IReadOnlyList<ComparacionFila>>([
                new() {
                    IdSolicitudCotizacionDetalle = 7, TipoBaseSolicitado = "PESO", TipoBaseOfrecido = "PESO",
                    IdProformaProveedor = 3, IdProformaProveedorDetalle = 5, EstadoOferta = "Cotizada",
                    CondicionComparacion = "Comparable", EsComparable = true, Vigente = true,
                    ContenidoTotalOfrecido = 0m, ContenidoTotalSolicitado = 0m, CubreCantidadSolicitada = true
                }
            ]);
    }
}
