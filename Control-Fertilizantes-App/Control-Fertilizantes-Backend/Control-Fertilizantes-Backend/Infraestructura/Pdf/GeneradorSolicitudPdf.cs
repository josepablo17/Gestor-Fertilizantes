using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using PdfSharp;
using PdfSharp.Drawing;
using PdfSharp.Fonts;
using PdfSharp.Pdf;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Contratos;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Modelos;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Servicios;

namespace Control_Fertilizantes_Backend.Infraestructura.Pdf;

public class GeneradorSolicitudPdf : IGeneradorSolicitudPdf
{
    public string VersionPlantilla => "GF-SOL-1";
    private static readonly Lazy<bool> Fuentes = new(() =>
    {
        GlobalFontSettings.FontResolver = new FuentesSolicitud();
        return true;
    });

    public byte[] Generar(Solicitud solicitud, SolicitudDestinatario destinatario)
    {
        if (solicitud.Estado != "Emitida" || solicitud.Lineas.Count is 0 or > 100 ||
            destinatario.IdSolicitudCotizacion != solicitud.IdSolicitudCotizacion)
            throw new InvalidOperationException("El PDF requiere una solicitud emitida y un destinatario relacionado.");
        _ = Fuentes.Value;
        using var documento = new PdfDocument();
        documento.Info.Title = $"Solicitud {solicitud.NumeroSolicitud} - versión {solicitud.VersionSolicitud}";
        documento.Info.Author = "Gestor de fertilizantes";
        documento.Info.Subject = $"Solicitud {solicitud.IdSolicitudCotizacion}; destinatario {destinatario.IdSolicitudCotizacionProveedor}; {VersionPlantilla}";
        using (var hoja = new LienzoSolicitud(documento, solicitud, destinatario, VersionPlantilla))
        {
            hoja.Parrafo("Complete los campos azules y devuelva este mismo PDF. Los importes y condiciones quedarán sujetos a revisión del cliente.");
            foreach (var campo in new[] { ("nombre", "Cliente"), ("identificacion", "Identificación"), ("direccion", "Dirección"), ("telefono", "Teléfono"), ("correo", "Correo") })
            {
                var texto = SolicitudServicio.TextoCliente(solicitud, campo.Item1);
                if (!string.IsNullOrWhiteSpace(texto)) hoja.Parrafo(campo.Item2 + ": " + texto);
            }
            hoja.Parrafo($"Fecha: {solicitud.FechaSolicitud:yyyy-MM-dd}    Límite de respuesta: {solicitud.FechaLimiteRespuesta?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture) ?? "Sin indicar"}");
            if (!string.IsNullOrWhiteSpace(solicitud.Observaciones)) hoja.Parrafo("Indicaciones del cliente: " + solicitud.Observaciones);
            hoja.FilaCampos(("cabecera_numeroProforma", "Número de proforma", "", 150), ("cabecera_fechaProforma", "Fecha (AAAA-MM-DD)", "", 10), ("cabecera_fechaVencimiento", "Vence (AAAA-MM-DD)", "", 10), ("cabecera_moneda", "Moneda (ej. CRC)", "", 3));
            hoja.Parrafo("Por renglón: precio por empaque, impuestos y total de esa línea. En observación indique cualquier alternativa (producto, marca, presentación y motivo).", 8);
            foreach (var linea in solicitud.Lineas.OrderBy(x => x.NumeroLinea)) hoja.Renglon(linea);
            hoja.Resumen();
        }
        using var salida = new MemoryStream();
        documento.Save(salida, closeStream: false);
        return salida.ToArray();
    }

    private sealed class FuentesSolicitud : IFontResolver
    {
        public FontResolverInfo ResolveTypeface(string familyName, bool bold, bool italic) => new(bold ? "GestorBold" : "GestorRegular", false, italic);
        public byte[] GetFont(string faceName)
        {
            var nombre = "LiberationSans-" + (faceName == "GestorBold" ? "Bold" : "Regular") + ".ttf";
            var assembly = typeof(GeneradorSolicitudPdf).Assembly;
            var recurso = assembly.GetManifestResourceNames().Single(x => x.EndsWith(nombre, StringComparison.Ordinal));
            using var stream = assembly.GetManifestResourceStream(recurso) ?? throw new InvalidOperationException("Falta la fuente PDF incluida.");
            using var bytes = new MemoryStream(); stream.CopyTo(bytes); return bytes.ToArray();
        }
    }

    private sealed class LienzoSolicitud : IDisposable
    {
        private const double Margen = 36, Ancho = 523, Limite = 792;
        private readonly PdfDocument documento;
        private readonly Solicitud solicitud;
        private readonly SolicitudDestinatario destino;
        private readonly string plantilla;
        private readonly XFont normal = new("Gestor Sans", 9);
        private readonly XFont pequeno = new("Gestor Sans", 8);
        private readonly XFont titulo = new("Gestor Sans", 19, XFontStyleEx.Bold);
        private readonly XFont negrita = new("Gestor Sans", 10, XFontStyleEx.Bold);
        private readonly PdfArray campos;
        private readonly PdfDictionary fuenteFormulario;
        private readonly HashSet<string> nombres = [];
        private PdfPage pagina = null!;
        private XGraphics? grafica;
        private double y;
        private XGraphics Grafica => grafica ?? throw new InvalidOperationException("La página está cerrada.");
        private static readonly XColor Verde = XColor.FromArgb(24, 83, 69);

        public LienzoSolicitud(PdfDocument doc, Solicitud s, SolicitudDestinatario d, string version)
        {
            documento = doc; solicitud = s; destino = d; plantilla = version;
            fuenteFormulario = new PdfDictionary(doc);
            fuenteFormulario.Elements.SetName("/Type", "/Font"); fuenteFormulario.Elements.SetName("/Subtype", "/Type1");
            fuenteFormulario.Elements.SetName("/BaseFont", "/Helvetica"); fuenteFormulario.Elements.SetName("/Encoding", "/WinAnsiEncoding");
            doc.Internals.AddObject(fuenteFormulario);
            var fuentes = new PdfDictionary(doc); fuentes.Elements["/Helv"] = fuenteFormulario.Reference;
            var recursos = new PdfDictionary(doc); recursos.Elements["/Font"] = fuentes;
            campos = new PdfArray(doc);
            var formulario = new PdfDictionary(doc);
            formulario.Elements["/Fields"] = campos;
            formulario.Elements["/DR"] = recursos;
            formulario.Elements.SetString("/DA", "/Helv 8 Tf 0 g");
            formulario.Elements.SetBoolean("/NeedAppearances", false);
            doc.Internals.Catalog.Elements["/AcroForm"] = formulario;
            NuevaPagina();
            Campo("gf_plantilla", plantilla, 0, 0, 1, 1, 40, oculto: true);
            Campo("gf_solicitud_id", s.IdSolicitudCotizacion.ToString(CultureInfo.InvariantCulture), 0, 0, 1, 1, 30, oculto: true);
            Campo("gf_solicitud_version", s.VersionSolicitud.ToString(CultureInfo.InvariantCulture), 0, 0, 1, 1, 20, oculto: true);
            Campo("gf_destinatario_id", d.IdSolicitudCotizacionProveedor.ToString(CultureInfo.InvariantCulture), 0, 0, 1, 1, 30, oculto: true);
            Campo("gf_proveedor_id", d.IdProveedor.ToString(CultureInfo.InvariantCulture), 0, 0, 1, 1, 20, oculto: true);
        }

        private void NuevaPagina()
        {
            grafica?.Dispose();
            pagina = documento.AddPage(); pagina.Size = PageSize.A4;
            pagina.Elements.SetName("/Tabs", "/R");
            grafica = XGraphics.FromPdfPage(pagina);
            Grafica.DrawRectangle(new XSolidBrush(Verde), 0, 0, pagina.Width.Point, 8);
            Grafica.DrawString("Solicitud de cotización", titulo, new XSolidBrush(Verde), new XRect(Margen, 29, Ancho, 27), XStringFormats.TopLeft);
            y = 63;
            foreach (var texto in Envolver($"{solicitud.NumeroSolicitud}  |  Versión {solicitud.VersionSolicitud}  |  Para: {destino.NombreProveedor}", pequeno))
            { Dibujar(texto, pequeno, Margen, y, Ancho, 11); y += 11; }
            Grafica.DrawLine(new XPen(XColors.LightGray, .6), Margen, y + 4, Margen + Ancho, y + 4);
            y += 16;
        }

        private void Espacio(double alto) { if (y + alto > Limite) NuevaPagina(); }
        private void Dibujar(string texto, XFont fuente, double x, double top, double ancho, double alto) =>
            Grafica.DrawString(texto, fuente, XBrushes.Black, new XRect(x, top, ancho, alto), XStringFormats.TopLeft);

        private List<string> Envolver(string texto, XFont fuente)
        {
            var resultado = new List<string>(); var actual = "";
            foreach (var palabraOriginal in Regex.Split(texto, @"\s+").Where(x => x.Length != 0))
            {
                var palabra = palabraOriginal;
                if (actual.Length != 0 && Grafica.MeasureString(actual + " " + palabra, fuente).Width > Ancho - 10)
                { resultado.Add(actual); actual = ""; }
                foreach (var letra in palabra)
                {
                    var siguiente = actual.Length == 0 ? letra.ToString() : actual + letra;
                    if (Grafica.MeasureString(siguiente, fuente).Width > Ancho - 10) { resultado.Add(actual); actual = letra.ToString(); }
                    else actual = siguiente;
                }
                actual += " ";
            }
            if (actual.Trim().Length != 0) resultado.Add(actual.Trim());
            return resultado;
        }

        public void Parrafo(string texto, double tamano = 9)
        {
            foreach (var linea in Envolver(texto, tamano == 8 ? pequeno : normal))
            { Espacio(12); Dibujar(linea, tamano == 8 ? pequeno : normal, Margen, y, Ancho, 12); y += 12; }
            y += 4;
        }

        public void FilaCampos(params (string Nombre, string Etiqueta, string Valor, int Maximo)[] fila)
        {
            Espacio(41);
            var ancho = Ancho / fila.Length;
            for (var i = 0; i < fila.Length; i++)
            {
                var x = Margen + i * ancho;
                Dibujar(fila[i].Etiqueta, pequeno, x, y, ancho - 5, 11);
                Campo(fila[i].Nombre, fila[i].Valor, x, y + 13, ancho - 5, 21, fila[i].Maximo);
            }
            y += 39;
        }

        public void Renglon(SolicitudLinea linea)
        {
            var detalle = $"{linea.NumeroLinea}. {linea.NombreProductoOriginal}" +
                (string.IsNullOrWhiteSpace(linea.MarcaOriginal) ? "" : $" | Marca: {linea.MarcaOriginal}") +
                $" | {linea.PresentacionOriginal} ({linea.ContenidoEmpaqueOriginal.ToString("G29", CultureInfo.InvariantCulture)} {linea.CodigoUnidadOriginal})" +
                $" | Solicitado: {linea.CantidadEmpaquesSolicitada.ToString("G29", CultureInfo.InvariantCulture)} empaques." +
                $" Alternativas: {(linea.PermiteAlternativas ? "permitidas" : "no permitidas")}." +
                (string.IsNullOrWhiteSpace(linea.Observaciones) ? "" : " Nota: " + linea.Observaciones);
            var lineas = Envolver(detalle, normal);
            var altoTexto = lineas.Count * 11 + 6;
            Espacio(altoTexto + 83);
            Grafica.DrawRectangle(new XSolidBrush(XColor.FromArgb(244, 247, 245)), Margen - 4, y - 3, Ancho + 4, altoTexto + 77);
            foreach (var texto in lineas) { Dibujar(texto, normal, Margen, y, Ancho, 11); y += 11; }
            y += 5;
            var prefijo = "linea_" + linea.IdSolicitudCotizacionDetalle.ToString(CultureInfo.InvariantCulture) + "_";
            Campo(prefijo + "id", linea.IdSolicitudCotizacionDetalle.ToString(CultureInfo.InvariantCulture), 0, 0, 1, 1, 30, oculto: true);
            FilaCampos((prefijo + "cantidadEmpaques", "Empaques ofrecidos", "", 24), (prefijo + "precioUnitario", "Precio / empaque", "", 30),
                (prefijo + "descuentoPorcentaje", "Descuento %", "", 12), (prefijo + "impuestoMonto", "Impuesto línea", "", 30),
                (prefijo + "totalLinea", "Total línea", "", 30), (prefijo + "baseTotalLinea", "Base del total (*)", "SinDefinir", 25));
            Dibujar("Estado: Cotizada / NoDisponible / SinCotizar", pequeno, Margen, y, 230, 11);
            Dibujar("Observación / alternativa (producto, marca, empaque y motivo)", pequeno, Margen + 231, y, 292, 11);
            Campo(prefijo + "estadoOferta", "SinCotizar", Margen, y + 13, 220, 21, 20);
            Campo(prefijo + "observaciones", "", Margen + 231, y + 13, 287, 21, 160, multilinea: true);
            y += 38;
        }

        public void Resumen()
        {
            Espacio(290);
            Dibujar("Totales y condiciones del proveedor", negrita, Margen, y, Ancho, 15); y += 23;
            FilaCampos(("cabecera_subtotal", "Subtotal", "", 30), ("cabecera_descuento", "Descuento global", "", 30), ("cabecera_iva", "IVA global", "", 30));
            FilaCampos(("cabecera_otrosCargos", "Otros cargos / transporte", "", 30), ("cabecera_total", "Total del documento", "", 30));
            foreach (var campo in new[] { ("cabecera_condicionesPago", "Condiciones de pago"), ("cabecera_condicionesEntrega", "Condiciones de entrega / observaciones") })
            {
                Dibujar(campo.Item2, pequeno, Margen, y, Ancho, 12);
                Campo(campo.Item1, "", Margen, y + 13, Ancho - 5, 32, 250, multilinea: true); y += 52;
            }
            Parrafo("(*) Base del total de cada línea: Bruto (antes de descuentos e impuestos), NetoSinImpuestos (con descuentos, sin impuestos) o ConImpuestos. Si la desconoce, conserve SinDefinir para revisión.", 8);
            Parrafo("Declare los ajustes globales una sola vez. No sume automáticamente el IVA global sobre líneas que ya incluyen impuestos. Guarde el PDF con sus cambios antes de devolverlo.", 8);
        }

        private void Campo(string nombre, string valor, double x, double top, double ancho, double alto, int maximo, bool oculto = false, bool multilinea = false)
        {
            if (!nombres.Add(nombre)) throw new InvalidOperationException("Campo PDF repetido.");
            var campo = new PdfDictionary(documento);
            campo.Elements.SetName("/Type", "/Annot"); campo.Elements.SetName("/Subtype", "/Widget"); campo.Elements.SetName("/FT", "/Tx");
            campo.Elements.SetString("/T", nombre); campo.Elements.SetString("/V", valor); campo.Elements.SetString("/DV", valor);
            campo.Elements.SetInteger("/F", oculto ? 2 : 4); campo.Elements.SetInteger("/Ff", oculto ? 1 : multilinea ? 4096 : 0);
            campo.Elements.SetInteger("/MaxLen", maximo);
            campo.Elements.SetString("/DA", "/Helv 0 Tf 0 g");
            campo.Elements["/P"] = pagina.Reference;
            campo.Elements.SetRectangle("/Rect", new PdfRectangle(new XRect(x, pagina.Height.Point - top - alto, ancho, alto)));
            var aparicion = new PdfDictionary(documento);
            aparicion.Elements.SetName("/Type", "/XObject"); aparicion.Elements.SetName("/Subtype", "/Form");
            aparicion.Elements.SetRectangle("/BBox", new PdfRectangle(new XRect(0, 0, ancho, alto)));
            var fuente = new PdfDictionary(documento); fuente.Elements["/Helv"] = fuenteFormulario.Reference;
            var recursos = new PdfDictionary(documento); recursos.Elements["/Font"] = fuente; aparicion.Elements["/Resources"] = recursos;
            var literal = valor.Replace("\\", "\\\\").Replace("(", "\\(").Replace(")", "\\)");
            var comandos = FormattableString.Invariant($"q 0.94 0.97 1 rg 0 0 {ancho} {alto} re f 0.55 0.67 0.76 RG 0.5 w 0.5 0.5 {ancho - 1} {alto - 1} re S /Tx BMC q 2 2 {Math.Max(0, ancho - 4)} {Math.Max(0, alto - 4)} re W n BT /Helv 8 Tf 0 g 3 {Math.Max(2, alto - 12)} Td ({literal}) Tj ET Q EMC Q");
            aparicion.CreateStream(Encoding.ASCII.GetBytes(comandos)); documento.Internals.AddObject(aparicion);
            var ap = new PdfDictionary(documento); ap.Elements["/N"] = aparicion.Reference; campo.Elements["/AP"] = ap;
            documento.Internals.AddObject(campo);
            var referencia = campo.Reference ?? throw new InvalidOperationException("El campo PDF no fue registrado.");
            campos.Elements.Add(referencia);
            pagina.Annotations.Elements.Add(referencia);
        }

        public void Dispose()
        {
            grafica?.Dispose(); grafica = null;
            for (var i = 0; i < documento.PageCount; i++)
            {
                using var pie = XGraphics.FromPdfPage(documento.Pages[i], XGraphicsPdfPageOptions.Append);
                pie.DrawString($"Solicitud {solicitud.IdSolicitudCotizacion} / destinatario {destino.IdSolicitudCotizacionProveedor} / v{solicitud.VersionSolicitud} / {plantilla}", pequeno,
                    XBrushes.DimGray, new XRect(Margen, 807, Ancho, 12), XStringFormats.TopLeft);
                pie.DrawString($"Página {i + 1} de {documento.PageCount}", pequeno, XBrushes.DimGray, new XRect(Margen, 821, Ancho, 12), XStringFormats.TopLeft);
            }
        }
    }
}
