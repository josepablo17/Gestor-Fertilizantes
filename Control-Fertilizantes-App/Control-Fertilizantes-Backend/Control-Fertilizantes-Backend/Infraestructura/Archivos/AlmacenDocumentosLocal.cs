using System.Net;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;
using Control_Fertilizantes_Backend.Comun.Errores;
using Control_Fertilizantes_Backend.Modulos.Documentos.Contratos;
using Control_Fertilizantes_Backend.Modulos.Documentos.Modelos;

namespace Control_Fertilizantes_Backend.Infraestructura.Archivos;

public class OpcionesDocumentos { public string RutaRaiz { get; set; } = "datos/documentos"; }

public class AlmacenDocumentosLocal(IOptions<OpcionesDocumentos> opciones, IHostEnvironment entorno) : IAlmacenDocumentos
{
    private const int MaximoBytes = 10 * 1024 * 1024;
    private readonly string raiz = Path.TrimEndingDirectorySeparator(Path.GetFullPath(opciones.Value.RutaRaiz, entorno.ContentRootPath));

    public async Task<ArchivoDocumentoGuardado> GuardarAsync(IdentidadDocumentoSolicitud identidad, byte[] contenido, CancellationToken cancelacion)
    {
        if (contenido.Length is 0 or > MaximoBytes) throw new InvalidOperationException("Tamano de PDF generado fuera de rango.");
        var clave = Prefijo(identidad) + Guid.NewGuid().ToString("N") + ".pdf";
        var ruta = Resolver(clave);
        ComprobarDirectorios(ruta);
        Directory.CreateDirectory(Path.GetDirectoryName(ruta)!);
        ComprobarDirectorios(ruta);
        var archivo = new FileStream(ruta, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, FileOptions.Asynchronous);
        try
        {
            await using (archivo)
            {
                await archivo.WriteAsync(contenido, cancelacion);
                await archivo.FlushAsync(cancelacion);
                archivo.Flush(flushToDisk: true);
            }
        }
        catch
        {
            // Este archivo aun no ha sido entregado al registrador SQL.
            File.Delete(ruta);
            throw;
        }
        return new(clave, SHA256.HashData(contenido), contenido.LongLength);
    }

    public async Task<byte[]> LeerVerificadoAsync(IdentidadDocumentoSolicitud identidad, Documento documento, CancellationToken cancelacion)
    {
        if (documento.Origen != "Generado" || documento.TipoContenido != "application/pdf" ||
            documento.TamanoBytes is <= 0 or > MaximoBytes || !documento.RutaAlmacenamiento.StartsWith(Prefijo(identidad), StringComparison.Ordinal))
            throw NoDisponible();
        try
        {
            var ruta = Resolver(documento.RutaAlmacenamiento);
            ComprobarDirectorios(ruta);
            if ((File.GetAttributes(ruta) & FileAttributes.ReparsePoint) != 0) throw NoDisponible();
            await using var archivo = new FileStream(ruta, FileMode.Open, FileAccess.Read, FileShare.Read, 81920, FileOptions.Asynchronous);
            if (archivo.Length != documento.TamanoBytes) throw NoDisponible();
            var contenido = new byte[checked((int)documento.TamanoBytes)];
            await archivo.ReadExactlyAsync(contenido, cancelacion);
            if (!CryptographicOperations.FixedTimeEquals(SHA256.HashData(contenido), documento.Sha256)) throw NoDisponible();
            return contenido;
        }
        catch (IOException) { throw NoDisponible(); }
        catch (UnauthorizedAccessException) { throw NoDisponible(); }
    }

    public Task EliminarNoRegistradoAsync(string clave)
    {
        var ruta = Resolver(clave);
        ComprobarDirectorios(ruta);
        File.Delete(ruta);
        return Task.CompletedTask;
    }

    private static string Prefijo(IdentidadDocumentoSolicitud id)
    {
        if (id.IdSolicitud <= 0 || id.IdDestinatario <= 0 || id.VersionSolicitud <= 0) throw new ArgumentOutOfRangeException(nameof(id));
        return $"solicitudes/{id.IdSolicitud}/v{id.VersionSolicitud}/dest-{id.IdDestinatario}/";
    }

    private string Resolver(string clave)
    {
        if (!Regex.IsMatch(clave, @"\Asolicitudes/[1-9][0-9]*/v[1-9][0-9]*/dest-[1-9][0-9]*/[a-f0-9]{32}\.pdf\z")) throw NoDisponible();
        var ruta = Path.GetFullPath(Path.Combine(raiz, clave.Replace('/', Path.DirectorySeparatorChar)));
        if (!Path.GetRelativePath(raiz, ruta).StartsWith("solicitudes" + Path.DirectorySeparatorChar, StringComparison.Ordinal)) throw NoDisponible();
        return ruta;
    }

    private void ComprobarDirectorios(string ruta)
    {
        var actual = new DirectoryInfo(Path.GetDirectoryName(ruta)!);
        while (actual is not null)
        {
            if (actual.Exists && (actual.Attributes & FileAttributes.ReparsePoint) != 0) throw NoDisponible();
            if (string.Equals(actual.FullName, raiz, OperatingSystem.IsWindows() ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal)) return;
            actual = actual.Parent;
        }
        throw NoDisponible();
    }

    private static ReglaNegocio NoDisponible() => new("El documento original no está disponible o no coincide con su registro. Restaure el archivo original.", HttpStatusCode.Conflict);
}
