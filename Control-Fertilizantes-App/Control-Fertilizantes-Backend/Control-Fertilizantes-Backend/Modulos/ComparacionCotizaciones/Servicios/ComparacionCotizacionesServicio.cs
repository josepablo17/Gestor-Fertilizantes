using System.Globalization;
using Control_Fertilizantes_Backend.Comun.Errores;
using Control_Fertilizantes_Backend.Comun.Validacion;
using Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.Contratos;
using Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.Modelos;

namespace Control_Fertilizantes_Backend.Modulos.ComparacionCotizaciones.Servicios;

public sealed class ComparacionCotizacionesServicio(IComparacionCotizacionesRepositorio repositorio)
{
    public async Task<ComparacionSolicitudDTO> CompararAsync(long idSolicitud, ComparacionSolicitudConsultaDTO entrada, CancellationToken cancelacion)
    {
        ValidacionCatalogo.Validar(entrada);
        if (idSolicitud <= 0 || entrada.IdSolicitudCotizacionDetalle is <= 0)
            throw new ReglaNegocio("Los identificadores de solicitud y renglón deben ser mayores que cero.");
        if (!DateOnly.TryParseExact(entrada.FechaReferencia, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var fecha))
            throw new ReglaNegocio("La fecha de referencia no es válida.");

        var criterio = new CriterioComparacion(idSolicitud, entrada.Moneda, entrada.BaseTotalLinea, fecha,
            entrada.IncluirAlternativas, entrada.IdSolicitudCotizacionDetalle, entrada.TipoBase);
        var (filas, referencias) = await repositorio.CompararAsync(criterio, cancelacion);
        var referenciasPorLinea = referencias.ToDictionary(fila => fila.IdSolicitudCotizacionDetalle);
        var lineas = filas.GroupBy(fila => fila.IdSolicitudCotizacionDetalle).Select(grupo =>
        {
            var linea = grupo.First();
            var referencia = referenciasPorLinea.TryGetValue(linea.IdSolicitudCotizacionDetalle, out var compra)
                ? new ReferenciaCompraDTO(compra.IdCompra, DateOnly.FromDateTime(compra.FechaCompra), compra.NombreProveedor, compra.PrecioPorUnidadBase)
                : null;
            return new LineaComparadaDTO(linea.IdSolicitudCotizacionDetalle, linea.NumeroLinea, linea.ProductoSolicitado,
                linea.MarcaSolicitada, linea.PresentacionSolicitada, linea.TipoBaseSolicitado, Unidad(linea.TipoBaseSolicitado),
                linea.CantidadEmpaquesSolicitada, linea.ContenidoTotalSolicitado, linea.MenorPrecioPorUnidadBase,
                linea.ContenidoTotalSolicitado > 0 ? linea.MenorPrecioConCoberturaYVigencia : null,
                grupo.Select(Oferta).ToArray(), referencia);
        }).ToArray();
        var documentos = filas.Where(fila => fila.IdProformaProveedor.HasValue)
            .DistinctBy(fila => fila.IdProformaProveedor).Select(Documento).ToArray();

        return new(idSolicitud, new(criterio.Moneda, criterio.BaseTotalLinea, criterio.FechaReferencia,
            criterio.IncluirAlternativas, criterio.IdSolicitudCotizacionDetalle, criterio.TipoBase), lineas, documentos);
    }

    private static OfertaComparadaDTO Oferta(ComparacionFila fila)
    {
        // SQL puede marcar una línea elegible aunque el importe normalizado no sea representable.
        var comparable = fila.EsComparable && fila.PrecioPorUnidadBase.HasValue;
        var condicion = fila.EsComparable && !comparable ? "PrecioNoRepresentable" : fila.CondicionComparacion;
        var cubreCantidad = fila.CubreCantidadSolicitada && fila.ContenidoTotalOfrecido is > 0 && fila.ContenidoTotalSolicitado > 0;
        return new(fila.IdSolicitudCotizacionProveedor, fila.IdProveedor, fila.NombreProveedorActual, fila.EstadoDestinatario,
            fila.IdProformaProveedor, fila.IdProformaProveedorDetalle, fila.TipoOferta, fila.EstadoOferta,
            fila.ProductoOfrecido, fila.MarcaOfrecida, fila.PresentacionOfrecida, fila.CantidadEmpaquesOfrecida,
            fila.ContenidoNormalizadoOriginal, fila.TipoBaseOfrecido is { } tipo ? Unidad(tipo) : null, fila.ContenidoTotalOfrecido,
            fila.PrecioUnitario, fila.TotalLinea, fila.BaseTotalLinea, fila.MotivoAlternativa, condicion, comparable,
            comparable ? fila.PrecioPorUnidadBase : null,
            cubreCantidad, fila.Vigente, comparable && fila.EsMenorPrecioUnitario,
            comparable && cubreCantidad && fila.EsMenorPrecioConCoberturaYVigencia);
    }

    private static DocumentoComparadoDTO Documento(ComparacionFila fila) => new(fila.IdProformaProveedor!.Value,
        fila.IdSolicitudCotizacionProveedor, fila.VersionRespuesta, fila.NumeroProforma, Fecha(fila.FechaProforma), Fecha(fila.FechaVencimiento),
        fila.Moneda, fila.EstadoConciliacion, fila.JustificacionConciliacion, fila.CondicionesPago, fila.CondicionesEntrega,
        new(fila.DescuentoGlobalDocumento, fila.IvaDocumento, fila.OtrosCargosDocumento), fila.TotalDocumento);

    private static DateOnly? Fecha(DateTime? fecha) => fecha.HasValue ? DateOnly.FromDateTime(fecha.Value) : null;

    private static string Unidad(string tipoBase) => tipoBase switch
    {
        "PESO" => "KG",
        "VOLUMEN" => "L",
        "UNIDAD" => "UND",
        _ => throw new InvalidOperationException("La comparación recibió una dimensión desconocida.")
    };
}
