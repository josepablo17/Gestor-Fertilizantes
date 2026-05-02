using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Interfaces;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using UglyToad.PdfPig;

namespace TuProyecto.Services
{
    public class ProformaPdfServicio : IProformaPdfServicio
    {
        public async Task<VistaPreviaProformaPdfDTO> ProcesarProformaPdfAsync(IFormFile archivoPdf)
        {
            if (archivoPdf == null || archivoPdf.Length == 0)
                throw new ArgumentException("Debe proporcionar un archivo PDF válido.");

            if (!Path.GetExtension(archivoPdf.FileName).Equals(".pdf", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("El archivo debe ser un PDF.");

            using var memoryStream = new MemoryStream();
            await archivoPdf.CopyToAsync(memoryStream);
            memoryStream.Position = 0;

            var textoCompleto = ExtraerTextoPdf(memoryStream);

            if (string.IsNullOrWhiteSpace(textoCompleto))
                throw new ArgumentException("No se pudo extraer contenido del PDF.");

            var lineas = NormalizarLineas(textoCompleto);
            var textoNormalizado = NormalizarTextoCompleto(textoCompleto);
            var preview = new VistaPreviaProformaPdfDTO
            {
                NumeroProforma = ExtraerNumeroProformaRobusto(textoCompleto),
                Fecha = ExtraerFechaDesdeTexto(textoNormalizado),
                NombreNegocio = ExtraerNombreNegocio(textoNormalizado),
                NombreProveedorPdf = ExtraerNombreProveedorPdf(textoNormalizado),
                RazonSocial = ExtraerRazonSocial(textoNormalizado),
                Cedula = ExtraerCedula(textoNormalizado),
                Telefono = ExtraerTelefonoCliente(textoNormalizado),
                Vendedor = ExtraerVendedorDesdeTexto(textoNormalizado),
                TipoDocumento = ExtraerTipoDocumentoDesdeTexto(textoNormalizado),
                DiasCredito = ExtraerDiasCreditoDesdeTexto(textoNormalizado),
                FechaVencimiento = ExtraerFechaVencimientoDesdeTexto(textoNormalizado),
                Subtotal = ExtraerSubtotal(textoNormalizado),
                Descuento = ExtraerDescuento(textoNormalizado),
                Iva = ExtraerIva(textoNormalizado),
                Total = ExtraerTotal(textoNormalizado),
                Lineas = ExtraerLineasDesdeTextoCompactado(textoNormalizado)
            };

            return preview;
        }

        private string ExtraerNombreProveedorPdf(string texto)
        {
            var match = Regex.Match(
                texto,
                @"^(.*?)\s*Cédula\s*Jurídica:",
                RegexOptions.IgnoreCase
            );

            return match.Success ? match.Groups[1].Value.Trim() : string.Empty;
        }


        private List<ProformaPdfLineaDTO> ExtraerLineasDesdeTextoCompactado(string texto)
        {
            var lineas = new List<ProformaPdfLineaDTO>();

            var bloqueMatch = Regex.Match(
                texto,
                @"CODIGODESCRIPCIONCANTIDADPRECIODESC\.SUGERIDOTOTAL(.*?)SUB\-TOTAL",
                RegexOptions.IgnoreCase);

            if (!bloqueMatch.Success)
                return lineas;

            var bloqueDetalle = bloqueMatch.Groups[1].Value;

            var patronLinea = new Regex(
                @"(?<codigo>\d{3}\-\d{4})" +
                @"(?<descripcion>.*?)" +
                @"(?<cantidadPrecio>\d+[0-9,]*\.\d{2})" +
                @"(?<descuento>\*{3}|[0-9,]+\.\d{2}|[0-9]+)" +
                @"(?<sugerido>[0-9,]+\.\d{2})" +
                @"(?<total>[0-9,]+\.\d{2})" +
                @"(?=(\d{3}\-\d{4})|$)",
                RegexOptions.IgnoreCase);

            var matches = patronLinea.Matches(bloqueDetalle);

            foreach (Match match in matches)
            {
                var codigo = match.Groups["codigo"].Value.Trim();
                var descripcionBase = match.Groups["descripcion"].Value.Trim();
                var cantidadPrecio = match.Groups["cantidadPrecio"].Value.Trim();
                var descuento = ConvertirDescuento(match.Groups["descuento"].Value);
                var sugerido = ConvertirDecimal(match.Groups["sugerido"].Value);
                var totalLinea = ConvertirDecimal(match.Groups["total"].Value);

                var (descripcionFinal, cantidad, precio) = SepararCantidadYPrecioPegados(descripcionBase, cantidadPrecio, totalLinea);

                var linea = new ProformaPdfLineaDTO
                {
                    Codigo = codigo,
                    Descripcion = descripcionFinal,
                    Cantidad = cantidad,
                    Precio = precio,
                    DescuentoPorcentaje = descuento,
                    Sugerido = sugerido,
                    TotalLinea = totalLinea
                };

                lineas.Add(linea);
            }

            return lineas;
        }

        private (string descripcion, decimal cantidad, decimal precio) SepararCantidadYPrecioPegados(
    string descripcionBase,
    string cantidadPrecioTexto,
    decimal totalLinea)
        {
            if (string.IsNullOrWhiteSpace(cantidadPrecioTexto))
                return (descripcionBase.Trim(), 0m, 0m);

            decimal mejorCantidad = 0m;
            decimal mejorPrecio = 0m;
            string mejorDescripcion = descripcionBase.Trim();
            decimal mejorDiferencia = decimal.MaxValue;

            for (int i = 1; i <= Math.Min(3, cantidadPrecioTexto.Length - 4); i++)
            {
                var posibleCantidadTexto = cantidadPrecioTexto.Substring(0, i);
                var posiblePrecioTexto = cantidadPrecioTexto.Substring(i);

                if (!decimal.TryParse(
                        posibleCantidadTexto,
                        NumberStyles.Integer,
                        CultureInfo.InvariantCulture,
                        out var posibleCantidad))
                {
                    continue;
                }

                var posiblePrecio = ConvertirDecimal(posiblePrecioTexto);

                if (posibleCantidad <= 0 || posiblePrecio <= 0)
                    continue;

                var calculado = posibleCantidad * posiblePrecio;
                var diferencia = Math.Abs(calculado - totalLinea);

                if (diferencia < mejorDiferencia)
                {
                    mejorDiferencia = diferencia;
                    mejorCantidad = posibleCantidad;
                    mejorPrecio = posiblePrecio;
                    mejorDescripcion = descripcionBase.Trim();
                }
            }

            return (mejorDescripcion, mejorCantidad, mejorPrecio);
        }

       

        private decimal ConvertirDescuento(string valor)
        {
            if (string.IsNullOrWhiteSpace(valor))
                return 0m;

            if (valor.Contains("***"))
                return 0m;

            return ConvertirDecimal(valor);
        }

        private decimal ExtraerTotal(string texto)
        {
            var matches = Regex.Matches(
                texto,
                @"TOTAL\s*([0-9,]+\.\d{2})",
                RegexOptions.IgnoreCase);

            if (matches.Count == 0)
                return 0m;

            var ultimo = matches[matches.Count - 1];
            return ConvertirDecimal(ultimo.Groups[1].Value);
        }

        private decimal ExtraerIva(string texto)
        {
            var match = Regex.Match(
                texto,
                @"I\.V\.A\.\s*([0-9,]+\.\d{2})",
                RegexOptions.IgnoreCase);

            return match.Success ? ConvertirDecimal(match.Groups[1].Value) : 0m;
        }

        private decimal ExtraerDescuento(string texto)
        {
            var match = Regex.Match(
                texto,
                @"DESCUENTO\s*([0-9,]+\.\d{2})",
                RegexOptions.IgnoreCase);

            return match.Success ? ConvertirDecimal(match.Groups[1].Value) : 0m;
        }
        private decimal ExtraerSubtotal(string texto)
        {
            var match = Regex.Match(
                texto,
                @"SUB\-TOTAL\s*([0-9,]+\.\d{2})",
                RegexOptions.IgnoreCase);

            return match.Success ? ConvertirDecimal(match.Groups[1].Value) : 0m;
        }
        private DateTime? ExtraerFechaVencimientoDesdeTexto(string texto)
        {
            var match = Regex.Match(
                texto,
                @"Vence\s*:\s*(\d{2}/\d{2}/\d{4})",
                RegexOptions.IgnoreCase);

            if (!match.Success)
                return null;

            return DateTime.TryParseExact(
                match.Groups[1].Value,
                "dd/MM/yyyy",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var fecha)
                ? fecha
                : null;
        }

        private int ExtraerDiasCreditoDesdeTexto(string texto)
        {
            var match = Regex.Match(
                texto,
                @"Días:\s*(\d+)",
                RegexOptions.IgnoreCase);

            return match.Success && int.TryParse(match.Groups[1].Value, out var dias)
                ? dias
                : 0;
        }

        private string ExtraerRazonSocial(string texto)
        {
            var match = Regex.Match(
                texto,
                @"Razón\s*Social:\s*(.*?)\s*Días:",
                RegexOptions.IgnoreCase);

            return match.Success ? match.Groups[1].Value.Trim() : string.Empty;
        }

        private string ExtraerTipoDocumentoDesdeTexto(string texto)
        {
            var match = Regex.Match(
                texto,
                @"Tipo:\s*(.*?)\s*Razón\s*Social:",
                RegexOptions.IgnoreCase);

            return match.Success ? match.Groups[1].Value.Trim() : string.Empty;
        }

        private string ExtraerVendedorDesdeTexto(string texto)
        {
            var match = Regex.Match(
                texto,
                @"Vendedor:\s*(.*?)\s*CODIGO",
                RegexOptions.IgnoreCase);

            return match.Success ? match.Groups[1].Value.Trim() : string.Empty;
        }
        private string ExtraerTelefonoCliente(string texto)
        {
            var match = Regex.Match(
                texto,
                @"Vence:\s*\d{2}/\d{2}/\d{4}\s*Tel\.\:\s*([0-9]+)",
                RegexOptions.IgnoreCase);

            return match.Success ? match.Groups[1].Value.Trim() : string.Empty;
        }
        private string ExtraerCedula(string texto)
        {
            var match = Regex.Match(
                texto,
                @"Cédula:\s*([0-9]+)",
                RegexOptions.IgnoreCase);

            return match.Success ? match.Groups[1].Value.Trim() : string.Empty;
        }
        private string ExtraerNombreNegocio(string texto)
        {
            var match = Regex.Match(
                texto,
                @"Nombre\s*del\s*Negocio:\s*(.*?)\s*Tipo:",
                RegexOptions.IgnoreCase);

            return match.Success ? match.Groups[1].Value.Trim() : string.Empty;
        }

        private string ExtraerNumeroProformaRobusto(string texto)
        {
            if (string.IsNullOrWhiteSpace(texto))
                return string.Empty;

            var opciones = RegexOptions.IgnoreCase | RegexOptions.CultureInvariant;
            var textoNormalizado = NormalizarTextoParaNumeroProforma(texto);

            var patrones = new[]
            {
        // Soporta:
        // PROFORMA P2-473524 FECHA
        // PROFORMAFC-082119FECHA
        // PROFORMA: FC-082119
        @"PROFORMA\s*(?:N[°º.]?|NO\.?|NRO\.?|NUMERO|NÚMERO|#)?\s*[:\-]?\s*(?<numero>[A-Z]{1,6}\d{0,4}-\d{3,})",

        // Soporta:
        // FC-082119 FECHA:
        // P2-473524 FECHA:
        @"(?<numero>[A-Z]{1,6}\d{0,4}-\d{3,})\s*FECHA\s*:",

        // Respaldo si el extractor quitó el guion:
        // PROFORMA FC082119
        // PROFORMAP2473524
        @"PROFORMA\s*(?:N[°º.]?|NO\.?|NRO\.?|NUMERO|NÚMERO|#)?\s*[:\-]?\s*(?<numero>[A-Z]{1,6}\d{4,})"
    };

            foreach (var patron in patrones)
            {
                var match = Regex.Match(textoNormalizado, patron, opciones);

                if (match.Success)
                    return FormatearNumeroProforma(match.Groups["numero"].Value);
            }

            return string.Empty;
        }

        private string NormalizarTextoParaNumeroProforma(string texto)
        {
            if (string.IsNullOrWhiteSpace(texto))
                return string.Empty;

            var normalizado = texto;

            normalizado = Regex.Replace(
                normalizado,
                @"[\u2010\u2011\u2012\u2013\u2014\u2212]",
                "-"
            );

            // P2 - 473524 => P2-473524
            // FC - 082119 => FC-082119
            normalizado = Regex.Replace(normalizado, @"\s*-\s*", "-");

            // FECHA : 28/03/2026 => FECHA: 28/03/2026
            normalizado = Regex.Replace(normalizado, @"\s*:\s*", ": ");

            normalizado = Regex.Replace(normalizado, @"\s+", " ");

            return normalizado.Trim();
        }

        private string FormatearNumeroProforma(string numero)
        {
            if (string.IsNullOrWhiteSpace(numero))
                return string.Empty;

            var limpio = Regex.Replace(numero.Trim().ToUpperInvariant(), @"\s+", "");

            if (limpio.Contains("-"))
                return limpio;

            var match = Regex.Match(
                limpio,
                @"^(?<prefijo>[A-Z]{1,6}\d{0,4})(?<consecutivo>\d{3,})$",
                RegexOptions.IgnoreCase | RegexOptions.CultureInvariant
            );

            if (!match.Success)
                return limpio;

            return $"{match.Groups["prefijo"].Value}-{match.Groups["consecutivo"].Value}";
        }


        private DateTime? ExtraerFechaDesdeTexto(string texto)
        {
            var match = Regex.Match(
                texto,
                @"FECHA\s*:\s*(\d{2}/\d{2}/\d{4})",
                RegexOptions.IgnoreCase);

            if (!match.Success)
                return null;

            return DateTime.TryParseExact(
                match.Groups[1].Value,
                "dd/MM/yyyy",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var fecha)
                ? fecha
                : null;
        }

        private string ExtraerTextoPdf(Stream pdfStream)
        {
            var sb = new StringBuilder();

            using var document = PdfDocument.Open(pdfStream);
            foreach (var page in document.GetPages())
            {
                sb.AppendLine(page.Text);
            }

            return sb.ToString();
        }

        private List<string> NormalizarLineas(string textoCompleto)
        {
            return textoCompleto
                .Split(new[] { "\r\n", "\n", "\r" }, StringSplitOptions.RemoveEmptyEntries)
                .Select(x => Regex.Replace(x, @"\s+", " ").Trim())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .ToList();
        }


        private decimal ConvertirDecimal(string valor)
        {
            if (string.IsNullOrWhiteSpace(valor))
                return 0m;

            valor = valor.Replace(",", "").Trim();

            return decimal.TryParse(
                valor,
                NumberStyles.AllowDecimalPoint | NumberStyles.AllowLeadingSign,
                CultureInfo.InvariantCulture,
                out var numero)
                ? numero
                : 0m;
        }

        private string NormalizarTextoCompleto(string texto)
        {
            if (string.IsNullOrWhiteSpace(texto))
                return string.Empty;

            texto = texto.Replace("\r", " ").Replace("\n", " ");
            texto = Regex.Replace(texto, @"\s+", " ").Trim();

            return texto;
        }

    }
}