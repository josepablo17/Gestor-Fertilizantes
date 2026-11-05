using System.Text.Json;
using PdfSharp.Pdf.IO;
using PdfSharp.Pdf.Advanced;
using Control_Fertilizantes_Backend.Infraestructura.Pdf;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Modelos;

namespace GestorFertilizantes.Backend.Tests;

public class SolicitudesPdfPruebas
{
    public static Solicitud Ejemplo(int cantidad = 8)
    {
        var nombres = new[] { "Nitrato de calcio", "Nitrato de magnesio", "Sulfato de potasio", "Sulfato de magnesio", "Nitrato de potasio", "Fosfato de potasio", "MAP 12-60-0", "Nitrato de amonio" };
        var empaques = new[] { 48m, 6m, 6m, 18m, 24m, 6m, 6m, 6m };
        var solicitud = new Solicitud
        {
            IdSolicitudCotizacion = 9007199254740993L, NumeroSolicitud = "SC-2026-DEMO", VersionSolicitud = 1,
            FechaSolicitud = new DateTime(2026, 11, 5), FechaLimiteRespuesta = new DateTime(2026, 11, 12),
            Estado = "Emitida", FechaEmision = new DateTime(2026, 11, 5, 12, 0, 0), FechaCreacion = new DateTime(2026, 11, 5),
            DatosClienteOriginalJson = JsonSerializer.Serialize(new { nombre = "Finca de ejemplo (datos ficticios)", direccion = "Cartago, Costa Rica", telefono = "0000-0000" }),
            Observaciones = "Muestra de prueba. Cotizar los empaques indicados y señalar cualquier alternativa."
        };
        for (var i = 0; i < cantidad; i++)
        {
            var contenido = i % 8 == 1 ? 20m : i % 8 == 7 ? 45m : 25m;
            solicitud.Lineas.Add(new SolicitudLinea
            {
                IdSolicitudCotizacionDetalle = 3001L + i, IdSolicitudCotizacion = solicitud.IdSolicitudCotizacion,
                NumeroLinea = i + 1, IdProducto = i + 1, IdPresentacionProducto = i + 1,
                NombreProductoOriginal = nombres[i % 8], MarcaOriginal = "Marca de ejemplo",
                CantidadEmpaquesSolicitada = empaques[i % 8], PresentacionOriginal = i % 8 == 1 ? "Bidón" : "Saco",
                ContenidoEmpaqueOriginal = contenido, IdUnidadMedidaOriginal = i % 8 == 1 ? 3 : 1,
                CodigoUnidadOriginal = i % 8 == 1 ? "L" : "KG", TipoBaseOriginal = i % 8 == 1 ? "VOLUMEN" : "PESO",
                FactorConversionOriginal = 1m, ContenidoNormalizadoOriginal = contenido, PermiteAlternativas = true
            });
        }
        solicitud.Destinatarios.Add(new SolicitudDestinatario
        {
            IdSolicitudCotizacionProveedor = 2001, IdSolicitudCotizacion = solicitud.IdSolicitudCotizacion,
            IdProveedor = 1, NombreProveedor = "Proveedor de ejemplo", Estado = "PendienteEnvio"
        });
        return solicitud;
    }

    [Fact]
    public void Pdf_rellenable_conserva_ids_de_64_bits_y_todos_los_renglones()
    {
        var solicitud = Ejemplo();
        var bytes = new GeneradorSolicitudPdf().Generar(solicitud, solicitud.Destinatarios[0]);
        using var lector = PdfReader.Open(new MemoryStream(bytes), PdfDocumentOpenMode.Import);
        var formulario = lector.Internals.Catalog.Elements.GetDictionary("/AcroForm");
        Assert.NotNull(formulario);
        var campos = formulario.Elements.GetArray("/Fields");
        Assert.NotNull(campos);
        var valores = campos.Elements.Cast<PdfReference>().Select(x => (PdfSharp.Pdf.PdfDictionary)x.Value)
            .ToDictionary(x => x.Elements.GetString("/T"));
        var widgets = new Dictionary<string, PdfReference>();
        for (var i = 0; i < lector.PageCount; i++)
        {
            var anotaciones = lector.Pages[i].Elements.GetArray("/Annots");
            Assert.NotNull(anotaciones);
            foreach (var referencia in anotaciones.Elements.Cast<PdfReference>())
                widgets.Add(((PdfSharp.Pdf.PdfDictionary)referencia.Value).Elements.GetString("/T"), referencia);
        }
        Assert.Equal(valores.Count, widgets.Count);
        foreach (var (nombre, campo) in valores)
        {
            Assert.Equal(campo.Reference!.ObjectID, widgets[nombre].ObjectID);
            Assert.Equal("/Widget", campo.Elements.GetName("/Subtype"));
            var apariencia = campo.Elements.GetDictionary("/AP")?.Elements.GetDictionary("/N")?.Stream;
            Assert.NotNull(apariencia);
            Assert.NotEmpty(apariencia.Value);
        }
        Assert.Equal("9007199254740993", valores["gf_solicitud_id"].Elements.GetString("/V"));
        Assert.Equal("GF-SOL-1", valores["gf_plantilla"].Elements.GetString("/V"));
        Assert.Equal(1, valores["gf_solicitud_id"].Elements.GetInteger("/Ff"));
        Assert.False(valores.ContainsKey("precioNormalizado"));
        foreach (var linea in solicitud.Lineas)
        {
            Assert.Equal("SinCotizar", valores[$"linea_{linea.IdSolicitudCotizacionDetalle}_estadoOferta"].Elements.GetString("/V"));
            Assert.Equal("", valores[$"linea_{linea.IdSolicitudCotizacionDetalle}_precioUnitario"].Elements.GetString("/V"));
        }
        Assert.InRange(lector.PageCount, 2, 4);
        var salida = Path.Combine(DirectorioRepositorio(), "artifacts", "backend", "pdf", "Solicitud-ejemplo.pdf");
        Directory.CreateDirectory(Path.GetDirectoryName(salida)!);
        File.WriteAllBytes(salida, bytes);
    }

    [Fact]
    public void Pdf_usa_copias_del_documento_y_admite_cien_renglones()
    {
        var solicitud = Ejemplo(100);
        solicitud.Lineas[^1].NombreProductoOriginal = "Último renglón conservado";
        var bytes = new GeneradorSolicitudPdf().Generar(solicitud, solicitud.Destinatarios[0]);
        using var lector = UglyToad.PdfPig.PdfDocument.Open(bytes);
        Assert.True(lector.NumberOfPages > 10);
        Assert.Contains("Último renglón conservado", string.Join("\n", lector.GetPages().Select(x => x.Text)));
        Assert.InRange(bytes.Length, 1, 10 * 1024 * 1024);
    }

    [Fact]
    public void Pdf_rechaza_borrador_y_destinatario_ajeno()
    {
        var s = Ejemplo();
        var generador = new GeneradorSolicitudPdf();
        s.Estado = "Borrador";
        Assert.Throws<InvalidOperationException>(() => generador.Generar(s, s.Destinatarios[0]));
        s.Estado = "Emitida"; s.Destinatarios[0].IdSolicitudCotizacion = 1;
        Assert.Throws<InvalidOperationException>(() => generador.Generar(s, s.Destinatarios[0]));
    }

    public static string DirectorioRepositorio()
    {
        var directorio = new DirectoryInfo(AppContext.BaseDirectory);
        while (directorio is not null && !File.Exists(Path.Combine(directorio.FullName, "global.json"))) directorio = directorio.Parent;
        return directorio?.FullName ?? throw new InvalidOperationException("Falta la raíz del repositorio.");
    }
}
