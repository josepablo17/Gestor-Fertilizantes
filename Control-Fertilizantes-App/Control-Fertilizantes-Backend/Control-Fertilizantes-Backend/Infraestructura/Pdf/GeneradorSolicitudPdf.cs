using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using PdfSharp;
using PdfSharp.Drawing;
using PdfSharp.Fonts;
using PdfSharp.Pdf;
using Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Modelos;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Contratos;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Modelos;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Servicios;

namespace Control_Fertilizantes_Backend.Infraestructura.Pdf;

public class GeneradorSolicitudPdf : IGeneradorSolicitudPdf
{
    public string VersionPlantilla => ExtraccionProforma.PlantillaCalculada;
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
            hoja.Introduccion();
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
        private const double Margen = 32, Ancho = 531, Limite = 798, Relleno = 10;
        private readonly PdfDocument documento;
        private readonly Solicitud solicitud;
        private readonly SolicitudDestinatario destino;
        private readonly string plantilla;
        private readonly XFont pequeno = new("Gestor Sans", 9);
        private readonly XFont titulo = new("Gestor Sans", 25, XFontStyleEx.Bold);
        private readonly XFont seccion = new("Gestor Sans", 13, XFontStyleEx.Bold);
        private readonly XFont negrita = new("Gestor Sans", 11, XFontStyleEx.Bold);
        private readonly XFont etiqueta = new("Gestor Sans", 9, XFontStyleEx.Bold);
        private readonly PdfArray campos;
        private readonly PdfArray ordenCalculo;
        private readonly PdfDictionary fuenteFormulario;
        private readonly HashSet<string> nombres = [];
        private PdfPage pagina = null!;
        private XGraphics? grafica;
        private double y;
        private int paginaPartidas;
        private XGraphics Grafica => grafica ?? throw new InvalidOperationException("La página está cerrada.");
        private static readonly XSolidBrush Tinta = new(XColor.FromArgb(22, 41, 40));
        private static readonly XSolidBrush Secundario = new(XColor.FromArgb(70, 93, 93));
        private static readonly XSolidBrush Marca = new(XColor.FromArgb(13, 105, 85));
        private static readonly XSolidBrush FondoMarca = new(XColor.FromArgb(15, 49, 46));
        private static readonly XSolidBrush FondoSuave = new(XColor.FromArgb(241, 247, 245));
        private static readonly XSolidBrush VerdeClaro = new(XColor.FromArgb(180, 230, 215));
        private static readonly XPen Borde = new(XColor.FromArgb(211, 224, 222), .65);
        private static readonly (string Valor, string Etiqueta)[] Monedas =
            [("", "Seleccione"), ("CRC", "CRC - Colones"), ("USD", "USD - Dólares")];
        private static readonly (string Valor, string Etiqueta)[] Estados =
            [("SinCotizar", "Sin cotizar"), ("Cotizada", "Cotizada"), ("NoDisponible", "No disponible")];
        private static readonly (string Valor, string Etiqueta)[] Bases =
            [("SinDefinir", "Sin definir"), ("Bruto", "Bruto"), ("NetoSinImpuestos", "Sin impuestos"), ("ConImpuestos", "Con impuestos")];

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
            ordenCalculo = new PdfArray(doc);
            var formulario = new PdfDictionary(doc);
            formulario.Elements["/Fields"] = campos;
            formulario.Elements["/CO"] = ordenCalculo;
            formulario.Elements["/DR"] = recursos;
            formulario.Elements.SetString("/DA", "/Helv 10 Tf 0 g");
            formulario.Elements.SetBoolean("/NeedAppearances", false);
            doc.Internals.Catalog.Elements["/AcroForm"] = formulario;
            var scripts = new PdfDictionary(doc);
            var script = Accion(CalculosSolicitudPdf.Inicializar(s.Lineas.Select(LectorRespuestaPdf.Prefijo)));
            doc.Internals.AddObject(script);
            var listaScripts = new PdfArray(doc);
            listaScripts.Elements.Add(new PdfString("GestorCotizacion"));
            listaScripts.Elements.Add(script.Reference!);
            scripts.Elements["/Names"] = listaScripts;
            var nombresCatalogo = new PdfDictionary(doc);
            nombresCatalogo.Elements["/JavaScript"] = scripts;
            doc.Internals.Catalog.Elements["/Names"] = nombresCatalogo;
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
            var primera = documento.PageCount == 1;
            Grafica.DrawRectangle(FondoMarca, 0, 0, pagina.Width.Point, primera ? 67 : 43);
            Grafica.DrawRectangle(Marca, Margen, 11, 23, 23);
            Dibujar("GF", etiqueta, Margen + 5, 17, 17, 12, XBrushes.White);
            if (primera)
                Dibujar("GESTOR DE FERTILIZANTES", etiqueta, Margen + 32, 17, Ancho - 32, 12, VerdeClaro);
            Dibujar("Solicitud de cotización", primera ? titulo : seccion, primera ? Margen : Margen + 32,
                primera ? 34 : 16, Ancho - 32, primera ? 31 : 19, XBrushes.White);

            y = primera ? 76 : 52;
            var referencia = $"Solicitud {solicitud.NumeroSolicitud}  /  Versión {solicitud.VersionSolicitud}";
            if (documento.PageCount > 1) referencia += $"  /  Para {destino.NombreProveedor}";
            foreach (var linea in Envolver(referencia, etiqueta, Ancho))
            {
                Dibujar(linea, etiqueta, Margen, y, Ancho, 11, Marca);
                y += 11;
            }
            y += 8;
        }

        private void Espacio(double alto) { if (y + alto > Limite) NuevaPagina(); }
        private void Dibujar(string texto, XFont fuente, double x, double top, double ancho, double alto, XBrush? color = null) =>
            Grafica.DrawString(texto, fuente, color ?? Tinta, new XRect(x, top, ancho, alto), XStringFormats.TopLeft);

        private List<string> Envolver(string texto, XFont fuente, double ancho)
        {
            var resultado = new List<string>();
            var actual = "";
            foreach (var palabra in Regex.Split(texto.Trim(), @"\s+").Where(x => x.Length != 0))
            {
                var siguiente = actual.Length == 0 ? palabra : actual + " " + palabra;
                if (Grafica.MeasureString(siguiente, fuente).Width <= ancho)
                {
                    actual = siguiente;
                    continue;
                }
                if (actual.Length > 0) resultado.Add(actual);
                actual = palabra;
                if (Grafica.MeasureString(palabra, fuente).Width <= ancho) continue;
                actual = "";
                foreach (var letra in palabra)
                {
                    if (Grafica.MeasureString(actual + letra, fuente).Width > ancho)
                    {
                        resultado.Add(actual);
                        actual = "";
                    }
                    actual += letra;
                }
            }
            if (actual.Length > 0) resultado.Add(actual);
            return resultado;
        }

        public void Introduccion()
        {
            const double anchoTarjeta = (Ancho - 12) / 2;
            var nombre = SolicitudServicio.TextoCliente(solicitud, "nombre") ?? "Sin indicar";
            var datosCliente = new List<string>();
            foreach (var (clave, rotulo) in new[] { ("identificacion", "ID"), ("direccion", "Dirección"), ("telefono", "Teléfono"), ("correo", "Correo") })
            {
                var valor = SolicitudServicio.TextoCliente(solicitud, clave);
                if (!string.IsNullOrWhiteSpace(valor))
                    datosCliente.AddRange(Envolver($"{rotulo}: {valor}", pequeno, anchoTarjeta - 2 * Relleno));
            }
            var cliente = Envolver(nombre, negrita, anchoTarjeta - 2 * Relleno);
            var proveedor = Envolver(destino.NombreProveedor, negrita, anchoTarjeta - 2 * Relleno);
            string[] fechas = [$"Fecha de solicitud  {solicitud.FechaSolicitud:dd/MM/yyyy}",
                $"Límite de respuesta  {solicitud.FechaLimiteRespuesta?.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture) ?? "Sin indicar"}"];
            var alto = 28 + Math.Max(cliente.Count * 14 + datosCliente.Count * 12, proveedor.Count * 14 + fechas.Length * 12);
            Tarjeta("SOLICITADO POR", cliente, datosCliente, Margen, anchoTarjeta, alto);
            Tarjeta("PROVEEDOR DESTINATARIO", proveedor, fechas, Margen + anchoTarjeta + 12, anchoTarjeta, alto);
            y += alto + 8;

            Grafica.DrawRectangle(FondoSuave, Margen, y, Ancho, 40);
            Grafica.DrawRectangle(Marca, Margen, y, 3, 40);
            Dibujar("Complete los campos azules. Guarde y devuelva este PDF para revisión del cliente.",
                etiqueta, Margen + Relleno, y + 7, Ancho - 20, 12, Marca);
            Dibujar("Use coma o punto decimal. Los campos verdes se calculan en lectores compatibles.",
                pequeno, Margen + Relleno, y + 22, Ancho - 20, 12, Secundario);
            y += 46;

            if (!string.IsNullOrWhiteSpace(solicitud.Observaciones))
            {
                Parrafo("Indicaciones del cliente: " + solicitud.Observaciones);
            }
            Espacio(55);
            Encabezado("Datos de la proforma");
            FilaCampos(Margen, Ancho, ("cabecera_numeroProforma", "Número de proforma", "", 50),
                ("cabecera_fechaProforma", "Fecha (AAAA-MM-DD)", "", 10),
                ("cabecera_fechaVencimiento", "Vence (AAAA-MM-DD)", "", 10), ("cabecera_moneda", "Moneda", "", 3));
            y += 4;
        }

        private void Tarjeta(string rotulo, IReadOnlyList<string> nombre, IReadOnlyList<string> detalles, double x, double ancho, double alto)
        {
            Grafica.DrawRectangle(Borde, x, y, ancho, alto);
            Dibujar(rotulo, etiqueta, x + Relleno, y + 7, ancho - 24, 11, Marca);
            var top = y + 20;
            foreach (var linea in nombre)
            {
                Dibujar(linea, negrita, x + Relleno, top, ancho - 24, 14);
                top += 14;
            }
            foreach (var linea in detalles)
            {
                Dibujar(linea, pequeno, x + Relleno, top, ancho - 24, 12, Secundario);
                top += 12;
            }
        }

        private void Encabezado(string texto)
        {
            Dibujar(texto, seccion, Margen, y, Ancho, 17);
            y += 19;
        }

        private void Parrafo(string texto)
        {
            foreach (var linea in Envolver(texto, pequeno, Ancho))
            {
                Espacio(12);
                Dibujar(linea, pequeno, Margen, y, Ancho, 12, Secundario);
                y += 12;
            }
            y += 6;
        }

        private void FilaCampos(double inicio, double ancho, params (string Nombre, string Etiqueta, string Valor, int Maximo)[] fila)
        {
            const double separacion = 8;
            var anchoCampo = (ancho - (fila.Length - 1) * separacion) / fila.Length;
            for (var i = 0; i < fila.Length; i++)
            {
                var x = inicio + i * (anchoCampo + separacion);
                Dibujar(fila[i].Etiqueta, etiqueta, x, y, anchoCampo, 11, Secundario);
                Campo(fila[i].Nombre, fila[i].Valor, x, y + 12, anchoCampo, 17, fila[i].Maximo, ayuda: fila[i].Etiqueta);
            }
            y += 32;
        }

        public void Renglon(SolicitudLinea linea)
        {
            const double anchoInterior = Ancho - 2 * Relleno;
            const double anchoCantidad = 126;
            const double anchoProducto = anchoInterior - anchoCantidad - 34;
            var inicio = Margen + Relleno;
            var producto = Envolver(linea.NombreProductoOriginal, negrita, anchoProducto);
            var contenido = linea.ContenidoEmpaqueOriginal.ToString("G29", CultureInfo.InvariantCulture);
            var presentacion = $"{linea.PresentacionOriginal} ({contenido} {linea.CodigoUnidadOriginal})";
            if (!string.IsNullOrWhiteSpace(linea.MarcaOriginal)) presentacion += $"  /  {linea.MarcaOriginal}";
            var detalle = Envolver(presentacion, pequeno, anchoProducto);
            var nota = string.IsNullOrWhiteSpace(linea.Observaciones) ? [] : Envolver("Nota: " + linea.Observaciones, pequeno, anchoInterior);
            var altoCabecera = 12 + Math.Max(30, producto.Count * 14 + detalle.Count * 11) + nota.Count * 11;
            var alto = altoCabecera + 70;
            Espacio(alto + (paginaPartidas == documento.PageCount ? 0 : 19));
            if (paginaPartidas != documento.PageCount)
            {
                Encabezado("Partidas solicitadas");
                paginaPartidas = documento.PageCount;
            }

            Grafica.DrawRectangle(FondoSuave, Margen, y, Ancho, altoCabecera);
            Grafica.DrawRectangle(Borde, Margen, y, Ancho, alto);
            Grafica.DrawLine(Borde, Margen, y + altoCabecera, Margen + Ancho, y + altoCabecera);
            var top = y + 5;
            foreach (var texto in producto)
            {
                Dibujar(texto, negrita, inicio + 24, top, anchoProducto, 14);
                top += 14;
            }
            Dibujar(linea.NumeroLinea.ToString("00", CultureInfo.InvariantCulture), etiqueta, inicio, y + 6, 22, 11, Marca);
            foreach (var texto in detalle)
            {
                Dibujar(texto, pequeno, inicio + 24, top, anchoProducto, 11, Secundario);
                top += 11;
            }
            var xCantidad = Margen + Ancho - Relleno - anchoCantidad;
            Dibujar("EMPAQUES SOLICITADOS", etiqueta, xCantidad, y + 4, anchoCantidad, 11, Marca);
            Dibujar(linea.CantidadEmpaquesSolicitada.ToString("G29", CultureInfo.InvariantCulture),
                negrita, xCantidad, y + 14, anchoCantidad, 14);
            Dibujar(linea.PermiteAlternativas ? "Se aceptan alternativas" : "Sin alternativas",
                pequeno, xCantidad, y + 28, anchoCantidad, 11, Secundario);
            top = Math.Max(top, y + 40);
            foreach (var texto in nota)
            {
                Dibujar(texto, pequeno, inicio, top, anchoInterior, 11, Secundario);
                top += 11;
            }
            y += altoCabecera + 5;
            var prefijo = "linea_" + linea.IdSolicitudCotizacionDetalle.ToString(CultureInfo.InvariantCulture) + "_";
            Campo(prefijo + "id", linea.IdSolicitudCotizacionDetalle.ToString(CultureInfo.InvariantCulture), 0, 0, 1, 1, 30, oculto: true);
            FilaCampos(inicio, anchoInterior, (prefijo + "cantidadEmpaques", "Cant. ofrecida", "", 24), (prefijo + "precioUnitario", "Precio/empaque", "", 30),
                (prefijo + "descuentoPorcentaje", "Descuento (%)", "", 12), (prefijo + "impuestoMonto", "Impuesto", "", 30),
                (prefijo + "baseTotalLinea", "Base del total (*)", "SinDefinir", 25), (prefijo + "totalLinea", "Total de línea", "", 30));
            const double anchoEstado = 124;
            const double anchoNota = anchoInterior - anchoEstado - 8;
            var xNota = inicio + anchoEstado + 8;
            Dibujar("Estado de la oferta", etiqueta, inicio, y, anchoEstado, 11, Secundario);
            Dibujar("Alternativa / nota (producto, marca, empaque y motivo)", etiqueta, xNota, y, anchoNota, 11, Secundario);
            Campo(prefijo + "estadoOferta", "SinCotizar", inicio, y + 12, anchoEstado, 17, 20, ayuda: "Estado de la oferta");
            Campo(prefijo + "observaciones", "", xNota, y + 12, anchoNota, 17, 160, multilinea: true, ayuda: "Alternativa u observaciones");
            y += 40;
        }

        public void Resumen()
        {
            Espacio(201);
            Encabezado("Totales y condiciones");
            const double anchoInterior = Ancho - 2 * Relleno;
            var inicio = Margen + Relleno;
            Grafica.DrawRectangle(FondoSuave, Margen, y, Ancho, 72);
            y += 5;
            FilaCampos(inicio, anchoInterior, ("cabecera_subtotal", "Subtotal neto", "", 30),
                ("cabecera_descuento", "Descuento global", "", 30), ("cabecera_ivaAdicional", "IVA adicional", "", 30));
            FilaCampos(inicio, anchoInterior, ("cabecera_otrosCargos", "Otros cargos / transporte", "", 30),
                ("cabecera_iva", "IVA del documento", "", 30), ("cabecera_total", "Total del documento", "", 30));
            y += 9;
            const double anchoCondicion = (Ancho - 8) / 2;
            var x = Margen;
            foreach (var (nombre, rotulo) in new[] { ("cabecera_condicionesPago", "Condiciones de pago"), ("cabecera_condicionesEntrega", "Condiciones de entrega") })
            {
                Dibujar(rotulo, etiqueta, x, y, anchoCondicion, 12, Secundario);
                Campo(nombre, "", x, y + 12, anchoCondicion, 28, 250, multilinea: true, ayuda: rotulo);
                x += anchoCondicion + 8;
            }
            y += 46;
            Parrafo("(*) Bruto: antes de descuentos e impuestos. Sin impuestos: después del descuento de línea. Con impuestos: añade el impuesto de línea.");
            Parrafo("El subtotal ya incluye los descuentos de línea. Declare aparte los ajustes globales. El IVA adicional se suma al indicado por partida. Deje vacíos los ajustes que no apliquen.");
        }

        private PdfDictionary Accion(string codigo)
        {
            var accion = new PdfDictionary(documento);
            accion.Elements.SetName("/S", "/JavaScript");
            accion.Elements.SetString("/JS", codigo);
            return accion;
        }

        private void Campo(string nombre, string valor, double x, double top, double ancho, double alto, int maximo,
            bool oculto = false, bool multilinea = false, string? ayuda = null)
        {
            if (!nombres.Add(nombre)) throw new InvalidOperationException("Campo PDF repetido.");
            var clave = nombre[(nombre.LastIndexOf('_') + 1)..];
            var opciones = clave switch
            {
                "moneda" => Monedas,
                "estadoOferta" => Estados,
                "baseTotalLinea" => Bases,
                _ => null
            };
            var calculado = clave is "totalLinea" or "subtotal" or "iva" or "total";
            var campo = new PdfDictionary(documento);
            campo.Elements.SetName("/Type", "/Annot"); campo.Elements.SetName("/Subtype", "/Widget");
            campo.Elements.SetName("/FT", opciones is null ? "/Tx" : "/Ch");
            campo.Elements.SetString("/T", nombre); campo.Elements.SetString("/V", valor); campo.Elements.SetString("/DV", valor);
            if (ayuda is not null) campo.Elements.SetString("/TU", ayuda);
            campo.Elements.SetInteger("/F", oculto ? 2 : 4);
            campo.Elements.SetInteger("/Ff", oculto || calculado ? 1 : opciones is not null ? (1 << 17) | (1 << 26) : multilinea ? 1 << 12 : 0);
            if (opciones is null) campo.Elements.SetInteger("/MaxLen", maximo);
            campo.Elements.SetString("/DA", opciones is null ? "/Helv 0 Tf 0 g" : "/Helv 10 Tf 0 g");
            var visible = valor;
            if (opciones is not null)
            {
                var lista = new PdfArray(documento);
                foreach (var (opcion, etiquetaOpcion) in opciones)
                {
                    var par = new PdfArray(documento);
                    par.Elements.Add(new PdfString(opcion));
                    par.Elements.Add(new PdfString(etiquetaOpcion));
                    lista.Elements.Add(par);
                }
                campo.Elements["/Opt"] = lista;
                var seleccion = Array.FindIndex(opciones, opcion => opcion.Valor == valor);
                var indices = new PdfArray(documento);
                indices.Elements.Add(new PdfInteger(seleccion));
                campo.Elements["/I"] = indices;
                visible = opciones[seleccion].Etiqueta;
            }
            ConfigurarAcciones(campo, nombre, clave, ayuda);
            campo.Elements["/P"] = pagina.Reference;
            campo.Elements.SetRectangle("/Rect", new PdfRectangle(new XRect(x, pagina.Height.Point - top - alto, ancho, alto)));
            var aparicion = new PdfDictionary(documento);
            aparicion.Elements.SetName("/Type", "/XObject"); aparicion.Elements.SetName("/Subtype", "/Form");
            aparicion.Elements.SetRectangle("/BBox", new PdfRectangle(new XRect(0, 0, ancho, alto)));
            var fuente = new PdfDictionary(documento); fuente.Elements["/Helv"] = fuenteFormulario.Reference;
            var recursos = new PdfDictionary(documento); recursos.Elements["/Font"] = fuente; aparicion.Elements["/Resources"] = recursos;
            var literal = visible.Replace("\\", "\\\\").Replace("(", "\\(").Replace(")", "\\)");
            var fondo = calculado ? "0.93 0.97 0.95" : "0.94 0.97 1";
            var flecha = opciones is null ? "" : FormattableString.Invariant($"0.24 0.38 0.40 rg {ancho - 12} {alto / 2 + 2} m {ancho - 5} {alto / 2 + 2} l {ancho - 8.5} {alto / 2 - 2} l h f ");
            var comandos = FormattableString.Invariant($"q {fondo} rg 0 0 {ancho} {alto} re f 0.55 0.67 0.76 RG 0.5 w 0.5 0.5 {ancho - 1} {alto - 1} re S {flecha}/Tx BMC q 2 2 {Math.Max(0, ancho - 4)} {Math.Max(0, alto - 4)} re W n BT /Helv 10 Tf 0 g 3 {Math.Max(2, alto - 12)} Td ({literal}) Tj ET Q EMC Q");
            aparicion.CreateStream(Encoding.ASCII.GetBytes(comandos)); documento.Internals.AddObject(aparicion);
            var ap = new PdfDictionary(documento); ap.Elements["/N"] = aparicion.Reference; campo.Elements["/AP"] = ap;
            documento.Internals.AddObject(campo);
            var referencia = campo.Reference ?? throw new InvalidOperationException("El campo PDF no fue registrado.");
            campos.Elements.Add(referencia);
            pagina.Annotations.Elements.Add(referencia);
            if (calculado) ordenCalculo.Elements.Add(referencia);
        }

        private void ConfigurarAcciones(PdfDictionary campo, string nombre, string clave, string? ayuda)
        {
            var acciones = new PdfDictionary(documento);
            var rotulo = JsonSerializer.Serialize(ayuda ?? clave);
            switch (clave)
            {
                case "fechaProforma":
                case "fechaVencimiento":
                    acciones.Elements["/K"] = Accion("AFDate_KeystrokeEx('yyyy-mm-dd');");
                    acciones.Elements["/F"] = Accion("AFDate_FormatEx('yyyy-mm-dd');");
                    break;
                case "cantidadEmpaques":
                    acciones.Elements["/V"] = Accion($"GFValidar(event, {rotulo}, 14, 4, 0.0001, Infinity);");
                    break;
                case "precioUnitario":
                    acciones.Elements["/V"] = Accion($"GFValidar(event, {rotulo}, 12, 6, 0, Infinity);");
                    break;
                case "descuentoPorcentaje":
                    acciones.Elements["/V"] = Accion($"GFValidar(event, {rotulo}, 3, 2, 0, 100);");
                    acciones.Elements["/F"] = Accion("if (event.value !== '') event.value = event.value + ' %';");
                    break;
                case "impuestoMonto":
                case "descuento":
                case "ivaAdicional":
                case "otrosCargos":
                    acciones.Elements["/V"] = Accion($"GFValidar(event, {rotulo}, 14, 4, 0, Infinity);");
                    break;
                case "totalLinea":
                    var prefijo = nombre[..^clave.Length];
                    acciones.Elements["/C"] = Accion($"var partida = GFLinea(this, '{prefijo}'); event.value = partida ? GFMostrar(partida.total) : '';");
                    break;
                case "subtotal":
                case "iva":
                case "total":
                    acciones.Elements["/C"] = Accion($"event.value = GFResumen(this, '{clave}');");
                    break;
            }
            if (acciones.Elements.Count > 0) campo.Elements["/AA"] = acciones;
        }

        public void Dispose()
        {
            grafica?.Dispose(); grafica = null;
            for (var i = 0; i < documento.PageCount; i++)
            {
                using var pie = XGraphics.FromPdfPage(documento.Pages[i], XGraphicsPdfPageOptions.Append);
                pie.DrawLine(Borde, Margen, 807, Margen + Ancho, 807);
                pie.DrawString("Gestor de Fertilizantes  /  Solicitud de cotización", pequeno,
                    Secundario, new XRect(Margen, 816, Ancho, 12), XStringFormats.TopLeft);
                pie.DrawString($"Página {i + 1} de {documento.PageCount}", pequeno, Secundario,
                    new XRect(Margen, 816, Ancho, 12), XStringFormats.TopRight);
            }
        }
    }
}
