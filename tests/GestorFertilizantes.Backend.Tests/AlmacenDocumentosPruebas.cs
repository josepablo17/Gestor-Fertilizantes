using System.Security.Cryptography;
using Control_Fertilizantes_Backend.Comun.Errores;
using Control_Fertilizantes_Backend.Infraestructura.Archivos;
using Control_Fertilizantes_Backend.Modulos.Documentos.Modelos;
using Microsoft.Extensions.Options;

namespace GestorFertilizantes.Backend.Tests;

public class AlmacenDocumentosPruebas : IDisposable
{
    private readonly string basePruebas = Path.Combine(SolicitudesPdfPruebas.DirectorioRepositorio(), "artifacts", "backend", "almacen-pruebas");
    private readonly string carpeta;
    private static readonly IdentidadDocumentoSolicitud Identidad = new(1, 2, 3);
    public AlmacenDocumentosPruebas() => carpeta = Path.Combine(basePruebas, Guid.NewGuid().ToString("N"));
    private AlmacenDocumentosLocal Almacen() => new(Options.Create(new OpcionesDocumentos { RutaRaiz = carpeta }), new EntornoPrueba());
    private static Documento Meta(ArchivoDocumentoGuardado archivo) => new()
    {
        IdDocumento = 1, NombreOriginal = "Solicitud.pdf", RutaAlmacenamiento = archivo.Clave, Sha256 = archivo.Sha256,
        TamanoBytes = archivo.TamanoBytes, TipoContenido = "application/pdf", Origen = "Generado"
    };

    [Fact]
    public async Task Reinicio_del_almacen_recupera_bytes_originales_y_nunca_sobrescribe()
    {
        var contenido = new byte[] { 1, 2, 3, 4 };
        var primero = await Almacen().GuardarAsync(Identidad, contenido, default);
        var segundo = await Almacen().GuardarAsync(Identidad, contenido, default);
        Assert.NotEqual(primero.Clave, segundo.Clave);
        Assert.Equal(SHA256.HashData(contenido), primero.Sha256);
        Assert.Equal(contenido, await Almacen().LeerVerificadoAsync(Identidad, Meta(primero), default));
    }

    [Fact]
    public async Task Detecta_alteracion_sin_regenerar_y_rechaza_otro_destinatario()
    {
        var almacen = Almacen();
        var archivo = await almacen.GuardarAsync(Identidad, [1, 2, 3], default);
        await Assert.ThrowsAsync<ReglaNegocio>(() => almacen.LeerVerificadoAsync(new(1, 2, 9), Meta(archivo), default));
        await File.WriteAllBytesAsync(Path.Combine(carpeta, archivo.Clave.Replace('/', Path.DirectorySeparatorChar)), [3, 2, 1]);
        await Assert.ThrowsAsync<ReglaNegocio>(() => almacen.LeerVerificadoAsync(Identidad, Meta(archivo), default));
        Assert.Equal(new byte[] { 3, 2, 1 }, await File.ReadAllBytesAsync(Path.Combine(carpeta, archivo.Clave.Replace('/', Path.DirectorySeparatorChar))));
    }

    [Theory]
    [InlineData("../../archivo.pdf")]
    [InlineData("solicitudes/1/v2/dest-3/../../original.pdf")]
    [InlineData("C:/Windows/archivo.pdf")]
    public async Task Ruta_no_controlada_no_se_abre(string clave)
    {
        var meta = Meta(new(clave, new byte[32], 1));
        await Assert.ThrowsAsync<ReglaNegocio>(() => Almacen().LeerVerificadoAsync(Identidad, meta, default));
    }

    [Fact]
    public async Task Distingue_original_recibido_de_generado_y_protege_su_huella()
    {
        var almacen = Almacen();
        var contenido = new byte[] { 4, 3, 2, 1 };
        var archivo = await almacen.GuardarRecibidoAsync(Identidad, contenido, default);
        var metadata = Meta(archivo);
        metadata.Origen = "Recibido";
        Assert.Equal(contenido, await Almacen().LeerRecibidoVerificadoAsync(Identidad, metadata, default));
        await Assert.ThrowsAsync<ReglaNegocio>(() => almacen.LeerRecibidoVerificadoAsync(new(1, 1, 3), metadata, default));
        metadata.Origen = "Generado";
        await Assert.ThrowsAsync<ReglaNegocio>(() => almacen.LeerVerificadoAsync(Identidad, metadata, default));
        metadata.Origen = "Recibido";
        await File.WriteAllBytesAsync(Path.Combine(carpeta, archivo.Clave.Replace('/', Path.DirectorySeparatorChar)), [1, 2, 3, 4]);
        await Assert.ThrowsAsync<ReglaNegocio>(() => almacen.LeerRecibidoVerificadoAsync(Identidad, metadata, default));
    }

    public void Dispose()
    {
        if (Path.GetDirectoryName(carpeta) != basePruebas || !Guid.TryParseExact(Path.GetFileName(carpeta), "N", out _))
            throw new InvalidOperationException("La limpieza debe permanecer dentro de la carpeta temporal propia.");
        if (Directory.Exists(carpeta)) Directory.Delete(carpeta, recursive: true);
    }
}
