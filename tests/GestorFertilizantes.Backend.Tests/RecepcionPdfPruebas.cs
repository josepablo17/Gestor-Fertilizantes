using System.Net;
using Control_Fertilizantes_Backend.Comun.Errores;
using Control_Fertilizantes_Backend.Infraestructura.Pdf;
using Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Servicios;
using Microsoft.Extensions.Logging.Abstractions;
using PdfSharp.Pdf;
using PdfSharp.Pdf.Advanced;
using PdfSharp.Pdf.IO;

namespace GestorFertilizantes.Backend.Tests;

public class RecepcionPdfPruebas
{
    private readonly LectorRespuestaPdf lector = new(NullLogger<LectorRespuestaPdf>.Instance);

    [Fact]
    public void Lee_formulario_guardado_en_dos_paginas_y_conserva_id_y_texto_literal()
    {
        var solicitud = SolicitudesPdfPruebas.Ejemplo();
        var destino = solicitud.Destinatarios[0];
        var pdf = Cambiar(new GeneradorSolicitudPdf().Generar(solicitud, destino), new Dictionary<string, string>
        {
            ["cabecera_moneda"] = "CRC",
            ["cabecera_total"] = "15092.00",
            ["linea_3001_estadoOferta"] = "Cotizada",
            ["linea_3001_cantidadEmpaques"] = "2",
            ["linea_3001_precioUnitario"] = "7546.00",
            ["linea_3001_totalLinea"] = "15092.00",
            ["linea_3001_baseTotalLinea"] = "NetoSinImpuestos",
            ["linea_3008_estadoOferta"] = "NoDisponible",
            ["linea_3008_observaciones"] = "Sin existencias en la región."
        });

        var borrador = PreparadorBorradorRespuesta.Preparar(solicitud, lector.Leer(pdf, solicitud, destino, "GF-SOL-1"));
        Assert.Equal("AcroForm", borrador.Extraccion.Metodo);
        Assert.Equal("Completada", borrador.Extraccion.Estado);
        Assert.Contains(borrador.Extraccion.Campos, x => x.Nombre == "gf_solicitud_id" && x.Valor == "9007199254740993");
        Assert.Contains(borrador.Extraccion.Campos, x => x.Nombre == "linea_3001_precioUnitario" && x.Valor == "7546.00");
        Assert.Equal(7546m, borrador.Lineas[0].PrecioUnitario);
        Assert.Equal(2m, borrador.Lineas[0].CantidadEmpaques);
        Assert.Equal(25m, borrador.Lineas[0].ContenidoNormalizadoOriginal);
        Assert.Equal("NoDisponible", borrador.Lineas[^1].EstadoOferta);
        Assert.Equal("Sin existencias en la región.", borrador.Lineas[^1].Observacion);
        Assert.Null(borrador.Lineas[^1].PrecioUnitario);
        Assert.Null(borrador.Cabecera.Iva);
    }

    [Fact]
    public void El_lector_no_redondea_importes_ni_asocia_alternativas_en_observaciones()
    {
        var solicitud = SolicitudesPdfPruebas.Ejemplo(1);
        var destino = solicitud.Destinatarios[0];
        var pdf = Cambiar(new GeneradorSolicitudPdf().Generar(solicitud, destino), new Dictionary<string, string>
        {
            ["cabecera_moneda"] = "crc",
            ["linea_3001_estadoOferta"] = "Cotizada",
            ["linea_3001_cantidadEmpaques"] = "2.000010",
            ["linea_3001_precioUnitario"] = "7,546.00",
            ["linea_3001_totalLinea"] = "0",
            ["linea_3001_observaciones"] = "Alternativa en otro empaque"
        });
        var borrador = PreparadorBorradorRespuesta.Preparar(solicitud, lector.Leer(pdf, solicitud, destino, "GF-SOL-1"));
        var linea = Assert.Single(borrador.Lineas);
        Assert.Null(linea.CantidadEmpaques);
        Assert.Null(linea.PrecioUnitario);
        Assert.Null(linea.IdPresentacionProducto);
        Assert.Null(borrador.Cabecera.Moneda);
        Assert.Equal(0m, linea.TotalLinea);
        Assert.Equal("Parcial", borrador.Extraccion.Estado);
        Assert.Contains(borrador.Extraccion.Advertencias, x => x.Codigo == "PosibleAlternativa");
        Assert.Contains(borrador.Extraccion.Campos, x => x.Nombre == "linea_3001_precioUnitario" && x.Valor == "7,546.00");
    }

    [Fact]
    public void Rechaza_identidad_contradictoria_y_detecta_campos_sin_widget()
    {
        var solicitud = SolicitudesPdfPruebas.Ejemplo(1);
        var destino = solicitud.Destinatarios[0];
        var pdf = new GeneradorSolicitudPdf().Generar(solicitud, destino);
        var otro = Cambiar(pdf, new Dictionary<string, string> { ["gf_destinatario_id"] = "44" });
        var error = Assert.Throws<ReglaNegocio>(() => lector.Leer(otro, solicitud, destino, "GF-SOL-1"));
        Assert.Equal(HttpStatusCode.Conflict, error.StatusCode);

        var separado = Cambiar(pdf, new Dictionary<string, string>(), documento => documento.Pages[0].Elements.Remove("/Annots"));
        var intento = lector.Leer(separado, solicitud, destino, "GF-SOL-1");
        Assert.Equal("Manual", intento.Metodo);
        Assert.Equal("FormularioIncompleto", Assert.Single(intento.Advertencias).Codigo);
    }

    [Fact]
    public void Documento_distinto_deja_solicitados_sin_precios_y_rechaza_archivo_invalido()
    {
        var solicitud = SolicitudesPdfPruebas.Ejemplo(2);
        var destino = solicitud.Destinatarios[0];
        using var externo = new PdfDocument();
        externo.AddPage();
        using var bytes = new MemoryStream();
        externo.Save(bytes, false);
        var borrador = PreparadorBorradorRespuesta.Preparar(solicitud, lector.Leer(bytes.ToArray(), solicitud, destino, "GF-SOL-1"));
        Assert.Equal("NoCompatible", borrador.Extraccion.Estado);
        Assert.Equal(solicitud.Lineas.Select(x => (long?)x.IdSolicitudCotizacionDetalle), borrador.Lineas.Select(x => x.IdSolicitudDetalle));
        Assert.All(borrador.Lineas, x =>
        {
            Assert.Equal("SinCotizar", x.EstadoOferta);
            Assert.Null(x.NumeroLinea);
            Assert.Null(x.CantidadEmpaques);
            Assert.Null(x.PrecioUnitario);
        });
        Assert.Throws<ReglaNegocio>(() => lector.Leer("%PDF-1.7\nArchivo incompleto"u8.ToArray(), solicitud, destino, "GF-SOL-1"));
    }

    private static byte[] Cambiar(byte[] pdf, IReadOnlyDictionary<string, string> valores, Action<PdfDocument>? modificar = null)
    {
        using var documento = PdfReader.Open(new MemoryStream(pdf), PdfDocumentOpenMode.Modify);
        var campos = documento.Internals.Catalog.Elements.GetDictionary("/AcroForm")?.Elements.GetArray("/Fields")
            ?? throw new InvalidOperationException("Falta el AcroForm de prueba.");
        foreach (var referencia in campos.Elements.Cast<PdfReference>())
        {
            var campo = (PdfDictionary)referencia.Value;
            if (valores.TryGetValue(campo.Elements.GetString("/T"), out var valor)) campo.Elements.SetString("/V", valor);
        }
        modificar?.Invoke(documento);
        using var salida = new MemoryStream();
        documento.Save(salida, false);
        return salida.ToArray();
    }
}
