using System.Globalization;
using System.Text.RegularExpressions;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.Modelos;
using Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Modelos;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Modelos;

namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Servicios;

public static class PreparadorBorradorRespuesta
{
    private const string FechaIso = "yyyy-MM-dd";

    public static BorradorRespuesta Preparar(Solicitud solicitud, ExtraccionProforma extraccion)
    {
        var cabecera = new CabeceraGuardarRespuesta();
        if (extraccion.Metodo != "AcroForm")
            return new(cabecera, solicitud.Lineas.Select(x => new LineaGuardarRespuesta
            {
                IdSolicitudDetalle = x.IdSolicitudCotizacionDetalle
            }).ToArray(), extraccion);

        var campos = extraccion.Campos.ToDictionary(x => x.Nombre, x => x.Valor, StringComparer.Ordinal);
        var advertencias = extraccion.Advertencias.ToList();
        var calcular = extraccion.VersionPlantilla == ExtraccionProforma.PlantillaCalculada;
        bool TieneValor(string campo) => Limpiar(campos.GetValueOrDefault(campo)) is not null;
        string? Texto(string campo, int maximo)
        {
            var valor = Limpiar(campos.GetValueOrDefault(campo));
            if (valor?.Length <= maximo) return valor;
            if (valor is not null) Aviso("Longitud", "El texto excede la longitud admitida.", campo);
            return null;
        }

        DateOnly? Fecha(string campo)
        {
            var valor = Texto(campo, 10);
            if (valor is null) return null;
            if (DateOnly.TryParseExact(valor, FechaIso, CultureInfo.InvariantCulture, DateTimeStyles.None, out var fecha)) return fecha;
            Aviso("FechaInvalida", "Use una fecha con formato AAAA-MM-DD.", campo);
            return null;
        }

        decimal? Numero(string campo, int precision, int escala, bool positivo = false, decimal? maximo = null)
        {
            var valor = Limpiar(campos.GetValueOrDefault(campo));
            if (valor is null) return null;
            if (calcular) valor = valor.Replace(',', '.');
            var partes = Regex.Match(valor, @"\A([0-9]+)(?:\.([0-9]+))?\z");
            if (partes.Success && partes.Groups[1].Value.TrimStart('0').Length <= precision - escala &&
                partes.Groups[2].Value.TrimEnd('0').Length <= escala &&
                decimal.TryParse(valor, NumberStyles.AllowDecimalPoint, CultureInfo.InvariantCulture, out var numero) &&
                (!positivo || numero > 0) && (!maximo.HasValue || numero <= maximo))
                return numero;
            Aviso("DecimalInvalido", "El valor requiere revisión. Escriba un número dentro del rango, sin separadores de miles ni símbolos.", campo);
            return null;
        }

        void Aviso(string codigo, string mensaje, string? campo = null) => advertencias.Add(new(codigo, mensaje, campo));

        decimal? ImporteCalculado(string campo, decimal importe)
        {
            if (importe is < 0 or >= 100_000_000_000_000m)
            {
                Aviso("CalculoFueraDeRango", "El importe calculado está fuera del rango admitido.", campo);
                return null;
            }
            var guardado = Numero(campo, 18, 4);
            if (guardado.HasValue && guardado.Value != importe)
                Aviso("ImporteRecalculado", "El importe guardado difiere del cálculo. Revise el PDF original.", campo);
            return importe;
        }

        cabecera.NumeroProforma = Texto("cabecera_numeroProforma", 50);
        cabecera.FechaProforma = Fecha("cabecera_fechaProforma");
        cabecera.FechaVencimiento = Fecha("cabecera_fechaVencimiento");
        if (cabecera.FechaVencimiento < cabecera.FechaProforma)
        {
            cabecera.FechaVencimiento = null;
            Aviso("FechaInconsistente", "El vencimiento es anterior a la fecha de la proforma.", "cabecera_fechaVencimiento");
        }
        var moneda = Texto("cabecera_moneda", 3);
        if (moneda is not null && (calcular ? moneda is not ("CRC" or "USD") : !Regex.IsMatch(moneda, @"\A[A-Z]{3}\z")))
            Aviso("MonedaInvalida", calcular ? "Seleccione CRC o USD." : "Indique una moneda de tres letras mayúsculas.", "cabecera_moneda");
        else cabecera.Moneda = moneda;
        cabecera.Subtotal = calcular ? null : Numero("cabecera_subtotal", 18, 4);
        cabecera.Descuento = Numero("cabecera_descuento", 18, 4);
        cabecera.Iva = calcular ? null : Numero("cabecera_iva", 18, 4);
        cabecera.OtrosCargos = Numero("cabecera_otrosCargos", 18, 4);
        cabecera.Total = calcular ? null : Numero("cabecera_total", 18, 4);
        cabecera.CondicionesPago = Texto("cabecera_condicionesPago", 1000);
        cabecera.CondicionesEntrega = Texto("cabecera_condicionesEntrega", 1000);

        var lineas = new List<LineaGuardarRespuesta>();
        decimal subtotal = 0, ivaLineas = 0;
        var resumenCompleto = true;
        var hayCotizada = false;
        foreach (var pedida in solicitud.Lineas)
        {
            var p = FormattableString.Invariant($"linea_{pedida.IdSolicitudCotizacionDetalle}_");
            var linea = new LineaGuardarRespuesta
            {
                IdSolicitudDetalle = pedida.IdSolicitudCotizacionDetalle,
                NumeroLinea = pedida.NumeroLinea,
                Descripcion = pedida.NombreProductoOriginal,
                Observacion = Texto(p + "observaciones", 1000)
            };
            var estado = Texto(p + "estadoOferta", 20);
            if (estado is "Cotizada" or "NoDisponible" or "SinCotizar") linea.EstadoOferta = estado;
            else
            {
                Aviso("EstadoOfertaInvalido", "Revise el estado de la oferta.", p + "estadoOferta");
                resumenCompleto = false;
            }

            if (estado == "Cotizada")
            {
                linea.CantidadEmpaques = Numero(p + "cantidadEmpaques", 18, 4, positivo: true);
                linea.PrecioUnitario = Numero(p + "precioUnitario", 18, 6);
                linea.DescuentoPorcentaje = Numero(p + "descuentoPorcentaje", 5, 2, maximo: 100);
                linea.ImpuestoMonto = Numero(p + "impuestoMonto", 18, 4);
                if (!calcular) linea.TotalLinea = Numero(p + "totalLinea", 18, 4);
                var baseTotal = Texto(p + "baseTotalLinea", 30);
                if (baseTotal is "Bruto" or "NetoSinImpuestos" or "ConImpuestos") linea.BaseTotalLinea = baseTotal;
                else Aviso("BaseSinConfirmar", "Revise si el total incluye descuentos o impuestos.", p + "baseTotalLinea");
                if (calcular)
                {
                    hayCotizada = true;
                    if (linea.CantidadEmpaques is decimal cantidad && linea.PrecioUnitario is decimal precio &&
                        linea.BaseTotalLinea != "SinDefinir" &&
                        (linea.DescuentoPorcentaje.HasValue || !TieneValor(p + "descuentoPorcentaje")) &&
                        (linea.ImpuestoMonto.HasValue || !TieneValor(p + "impuestoMonto")))
                    {
                        var bruto = cantidad * precio;
                        var neto = RedondearImporte(bruto * (1 - (linea.DescuentoPorcentaje ?? 0) / 100));
                        var iva = linea.ImpuestoMonto ?? 0;
                        linea.TotalLinea = ImporteCalculado(p + "totalLinea", linea.BaseTotalLinea switch
                        {
                            "Bruto" => RedondearImporte(bruto),
                            "ConImpuestos" => neto + iva,
                            _ => neto
                        });
                        subtotal += neto;
                        ivaLineas += iva;
                    }
                    resumenCompleto &= linea.TotalLinea.HasValue;
                }
                if (linea.CantidadEmpaques is null || linea.PrecioUnitario is null || linea.TotalLinea is null)
                    Aviso("OfertaIncompleta", "La oferta cotizada requiere cantidad, precio por empaque y total.", p + "estadoOferta");
                if (Limpiar(campos.GetValueOrDefault(p + "observaciones")) is null)
                    CopiarPresentacion(linea, pedida);
                else
                    Aviso("PosibleAlternativa", "Confirme el producto y la presentación: la observación puede describir una alternativa.", p + "observaciones");
            }
            else if (new[] { "cantidadEmpaques", "precioUnitario", "descuentoPorcentaje", "impuestoMonto", "totalLinea" }
                .Any(x => Limpiar(campos.GetValueOrDefault(p + x)) is not null))
                Aviso("ImportesSinOferta", "Hay cantidades o importes en un renglón sin marcar como cotizado. Se conservaron solo como evidencia.", p + "estadoOferta");
            lineas.Add(linea);
        }
        if (calcular && hayCotizada && resumenCompleto)
        {
            var ivaAdicional = Numero("cabecera_ivaAdicional", 18, 4);
            cabecera.Subtotal = ImporteCalculado("cabecera_subtotal", subtotal);
            if (ivaAdicional.HasValue || !TieneValor("cabecera_ivaAdicional"))
                cabecera.Iva = ImporteCalculado("cabecera_iva", ivaLineas + (ivaAdicional ?? 0));
            if (!TieneValor("cabecera_descuento")) cabecera.Descuento = 0;
            if (!TieneValor("cabecera_otrosCargos")) cabecera.OtrosCargos = 0;
            if (cabecera.Subtotal is decimal baseNeta && cabecera.Descuento is decimal descuento &&
                cabecera.Iva is decimal iva && cabecera.OtrosCargos is decimal cargos)
                cabecera.Total = ImporteCalculado("cabecera_total", baseNeta - descuento + iva + cargos);
        }
        if (lineas.All(x => x.EstadoOferta == "SinCotizar"))
            Aviso("SinDatosDeOferta", "No hay renglones marcados como cotizados o no disponibles. Verifique si el proveedor completó el formulario.");
        return new(cabecera, lineas, extraccion with { Estado = advertencias.Count == 0 ? "Completada" : "Parcial", Advertencias = advertencias });
    }

    private static decimal RedondearImporte(decimal valor) => Math.Round(valor, 4, MidpointRounding.AwayFromZero);

    public static void CopiarPresentacion(LineaGuardarRespuesta linea, SolicitudLinea pedida)
    {
        linea.IdProducto = pedida.IdProducto;
        linea.IdPresentacionProducto = pedida.IdPresentacionProducto;
        linea.NombreProductoOriginal = pedida.NombreProductoOriginal;
        linea.MarcaOriginal = pedida.MarcaOriginal;
        linea.PresentacionOriginal = pedida.PresentacionOriginal;
        linea.ContenidoEmpaqueOriginal = pedida.ContenidoEmpaqueOriginal;
        linea.IdUnidadMedidaOriginal = pedida.IdUnidadMedidaOriginal;
        linea.CodigoUnidadOriginal = pedida.CodigoUnidadOriginal;
        linea.TipoBaseOriginal = pedida.TipoBaseOriginal;
        linea.FactorConversionOriginal = pedida.FactorConversionOriginal;
        linea.ContenidoNormalizadoOriginal = pedida.ContenidoNormalizadoOriginal;
    }

    public static void CopiarPresentacion(LineaGuardarRespuesta linea, PresentacionProducto presentacion)
    {
        linea.IdProducto = presentacion.IdProducto;
        linea.IdPresentacionProducto = presentacion.IdPresentacionProducto;
        linea.NombreProductoOriginal = presentacion.NombreProducto;
        linea.MarcaOriginal = presentacion.Marca;
        linea.PresentacionOriginal = presentacion.Descripcion;
        linea.ContenidoEmpaqueOriginal = presentacion.Cantidad;
        linea.IdUnidadMedidaOriginal = presentacion.IdUnidadMedida;
        linea.CodigoUnidadOriginal = presentacion.CodigoUnidadMedida;
        linea.TipoBaseOriginal = presentacion.TipoBase;
        linea.FactorConversionOriginal = presentacion.FactorConversion;
        linea.ContenidoNormalizadoOriginal = presentacion.CantidadNormalizada;
    }

    public static string? Limpiar(string? valor) => string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
}
