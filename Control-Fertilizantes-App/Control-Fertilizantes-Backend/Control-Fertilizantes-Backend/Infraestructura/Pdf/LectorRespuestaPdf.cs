using System.Globalization;
using System.Net;
using Control_Fertilizantes_Backend.Comun.Errores;
using Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Contratos;
using Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Modelos;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Modelos;
using PdfSharp.Pdf;
using PdfSharp.Pdf.Advanced;
using PdfSharp.Pdf.IO;

namespace Control_Fertilizantes_Backend.Infraestructura.Pdf;

public sealed class LectorRespuestaPdf(ILogger<LectorRespuestaPdf> logger) : ILectorRespuestaPdf
{
    private const string Version = "GF-LECTOR-1";
    private const string Plantilla = "GF-SOL-1";
    private const int MaximoCampos = 1000;
    private const int MaximoCaracteresPorCampo = 4000;
    private static readonly string[] CamposCabecera = ["numeroProforma", "fechaProforma", "fechaVencimiento", "moneda",
        "subtotal", "descuento", "iva", "otrosCargos", "total", "condicionesPago", "condicionesEntrega"];
    private static readonly string[] CamposLinea = ["cantidadEmpaques", "precioUnitario", "descuentoPorcentaje", "impuestoMonto",
        "totalLinea", "baseTotalLinea", "estadoOferta", "observaciones"];

    public ExtraccionProforma Leer(byte[] contenido, Solicitud solicitud, SolicitudDestinatario destino, string? plantillaEnviada)
    {
        if (!contenido.AsSpan().StartsWith("%PDF-"u8))
            throw new ReglaNegocio("El archivo no tiene una cabecera PDF válida.");

        try
        {
            using var pdf = PdfReader.Open(new MemoryStream(contenido, writable: false), PdfDocumentOpenMode.Import);
            if (pdf.PageCount is < 1 or > 100) throw new ReglaNegocio("El PDF debe contener de 1 a 100 páginas.");
            var formulario = pdf.Internals.Catalog.Elements.GetDictionary("/AcroForm");
            var campos = formulario?.Elements.GetArray("/Fields");
            if (campos is null || campos.Elements.Count == 0)
                return Manual("SinFormulario", "El PDF no conserva campos de la plantilla. Revise el documento y capture la oferta.");
            if (campos.Elements.Count > MaximoCampos)
                throw new ReglaNegocio("El PDF excede el máximo de campos permitido.");

            var datos = new List<CampoPdf>();
            var referencias = new Dictionary<string, PdfObjectID>(StringComparer.Ordinal);
            var estructuraInvalida = formulario!.Elements.ContainsKey("/XFA");
            var tieneOtraLinea = false;
            var identidades = Identidades(solicitud, destino);
            var esperados = identidades.Keys.Concat(CamposCabecera.Select(x => "cabecera_" + x))
                .Concat(solicitud.Lineas.SelectMany(x => CamposLinea.Select(k => Prefijo(x) + k))).ToHashSet(StringComparer.Ordinal);
            foreach (var item in campos.Elements)
            {
                var diccionario = Resolver(item) as PdfDictionary;
                if (diccionario is null) { estructuraInvalida = true; continue; }
                var nombre = Cadena(diccionario, "/T");
                if (nombre is null || !esperados.Contains(nombre))
                {
                    if (nombre is not null && nombre.StartsWith("linea_", StringComparison.Ordinal) && nombre.EndsWith("_id", StringComparison.Ordinal))
                        tieneOtraLinea = true;
                    continue;
                }
                var valor = Cadena(diccionario, "/V");
                // Una identidad conocida y contradictoria nunca puede pasar al flujo manual.
                if (nombre != "gf_plantilla" && identidades.TryGetValue(nombre, out var identidad) &&
                    !string.IsNullOrWhiteSpace(valor) && !string.Equals(valor, identidad, StringComparison.Ordinal))
                    throw new ReglaNegocio("El formulario identifica otra solicitud, versión, línea o proveedor.", HttpStatusCode.Conflict);
                if (valor?.Length > MaximoCaracteresPorCampo)
                {
                    estructuraInvalida = true;
                    continue;
                }
                datos.Add(new(nombre, valor));
                if (item is not PdfReference referencia || diccionario.Elements.GetName("/FT") != "/Tx" ||
                    diccionario.Elements.GetName("/Subtype") != "/Widget" ||
                    (diccionario.Elements.ContainsKey("/V") && valor is null))
                    estructuraInvalida = true;
                else if (!referencias.TryAdd(nombre, referencia.ObjectID)) estructuraInvalida = true;
            }
            var version = datos.FirstOrDefault(x => x.Nombre == "gf_plantilla")?.Valor;
            if (version != Plantilla)
                return Manual("PlantillaDesconocida", "No se reconoció una plantilla compatible. Capture la oferta manualmente.", datos);
            if (tieneOtraLinea)
                throw new ReglaNegocio("El formulario contiene un renglón ajeno a la solicitud.", HttpStatusCode.Conflict);
            if (plantillaEnviada != Plantilla)
                return Manual("PlantillaNoVerificada", "No hay una plantilla original compatible registrada para este destinatario.", datos, Plantilla);
            if (estructuraInvalida || referencias.Count != esperados.Count ||
                identidades.Any(x => !datos.Any(d => d.Nombre == x.Key && d.Valor == x.Value)) ||
                !WidgetsCoinciden(pdf, referencias))
                return Manual("FormularioIncompleto", "Hay campos faltantes, ambiguos o desvinculados. Revise el PDF y capture la oferta.", datos, Plantilla);

            return new(Version, "AcroForm", "Completada", Plantilla, datos, []);
        }
        catch (ReglaNegocio) { throw; }
        catch (Exception error) when (error is PdfReaderException or InvalidOperationException or
            IOException or FormatException or ArgumentException or NotSupportedException or IndexOutOfRangeException or OverflowException)
        {
            logger.LogDebug("No se abrió un PDF recibido ({TipoError}).", error.GetType().Name);
            throw new ReglaNegocio("No se pudo abrir el PDF. Compruebe que se pueda leer y no esté protegido con contraseña.");
        }
    }

    internal static string Prefijo(SolicitudLinea linea) =>
        "linea_" + linea.IdSolicitudCotizacionDetalle.ToString(CultureInfo.InvariantCulture) + "_";

    private static Dictionary<string, string> Identidades(Solicitud solicitud, SolicitudDestinatario destino)
    {
        var ids = new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["gf_plantilla"] = Plantilla,
            ["gf_solicitud_id"] = solicitud.IdSolicitudCotizacion.ToString(CultureInfo.InvariantCulture),
            ["gf_solicitud_version"] = solicitud.VersionSolicitud.ToString(CultureInfo.InvariantCulture),
            ["gf_destinatario_id"] = destino.IdSolicitudCotizacionProveedor.ToString(CultureInfo.InvariantCulture),
            ["gf_proveedor_id"] = destino.IdProveedor.ToString(CultureInfo.InvariantCulture)
        };
        foreach (var linea in solicitud.Lineas)
            ids.Add(Prefijo(linea) + "id", linea.IdSolicitudCotizacionDetalle.ToString(CultureInfo.InvariantCulture));
        return ids;
    }

    private static bool WidgetsCoinciden(PdfDocument pdf, Dictionary<string, PdfObjectID> referencias)
    {
        var vistos = new HashSet<string>(StringComparer.Ordinal);
        for (var i = 0; i < pdf.PageCount; i++)
        {
            var anotaciones = pdf.Pages[i].Elements.GetArray("/Annots");
            if (anotaciones is null) continue;
            if (anotaciones.Elements.Count > MaximoCampos) return false;
            foreach (var item in anotaciones.Elements)
            {
                if (Resolver(item) is not PdfDictionary widget || widget.Elements.GetName("/Subtype") != "/Widget") continue;
                var nombre = Cadena(widget, "/T");
                if (nombre is null || !referencias.TryGetValue(nombre, out var esperada)) continue;
                if (item is not PdfReference referencia || referencia.ObjectID != esperada || !vistos.Add(nombre)) return false;
            }
        }
        return vistos.Count == referencias.Count;
    }

    private static PdfItem? Resolver(PdfItem? item) => item is PdfReference referencia ? referencia.Value : item;
    private static string? Cadena(PdfDictionary diccionario, string clave) =>
        Resolver(diccionario.Elements[clave]) is PdfString cadena ? cadena.Value : null;
    private static ExtraccionProforma Manual(string codigo, string mensaje, IReadOnlyList<CampoPdf>? datos = null, string? plantilla = null) =>
        new(Version, "Manual", "NoCompatible", plantilla, datos ?? [], [new(codigo, mensaje)]);
}
