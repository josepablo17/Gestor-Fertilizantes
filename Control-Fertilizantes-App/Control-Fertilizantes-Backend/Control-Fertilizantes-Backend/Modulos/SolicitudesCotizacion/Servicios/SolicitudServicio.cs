using System.Net;
using System.Text.Json;
using Control_Fertilizantes_Backend.Comun.Errores;
using Control_Fertilizantes_Backend.Comun.Paginacion;
using Control_Fertilizantes_Backend.Comun.Validacion;
using Control_Fertilizantes_Backend.Modulos.Documentos.Contratos;
using Control_Fertilizantes_Backend.Modulos.Documentos.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Documentos.Modelos;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Contratos;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Modelos;

namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Servicios;

public class SolicitudServicio(ISolicitudRepositorio repositorio, IGeneradorSolicitudPdf generador,
    IAlmacenDocumentos almacen, TimeProvider reloj, ILogger<SolicitudServicio> logger) : ISolicitudServicio
{
    private static readonly JsonSerializerOptions JsonWeb = new(JsonSerializerDefaults.Web);
    private static string? Limpiar(string? valor) => string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
    private static ReglaNegocio Error(string mensaje, HttpStatusCode estado = HttpStatusCode.BadRequest) => new(mensaje, estado);
    private static void Id(long id) { if (id <= 0) throw Error("El identificador debe ser mayor que cero."); }

    public async Task<SolicitudRespuestaDTO> GuardarBorradorAsync(long? id, SolicitudGuardarBorradorDTO entrada, CancellationToken cancelacion)
    {
        if (id.HasValue) Id(id.Value);
        ValidacionCatalogo.Validar(entrada);
        if (entrada.FechaLimiteRespuesta < entrada.FechaSolicitud) throw Error("La fecha límite no puede ser anterior a la solicitud.");
        if (entrada.DatosCliente is not null) ValidacionCatalogo.Validar(entrada.DatosCliente);
        foreach (var linea in entrada.Lineas) ValidacionCatalogo.Validar(linea);
        if (entrada.Lineas.Select(x => x.NumeroLinea).Distinct().Count() != entrada.Lineas.Count)
            throw Error("No se puede repetir el número de renglón.", HttpStatusCode.Conflict);
        if (entrada.Proveedores.Any(x => x <= 0)) throw Error("Los proveedores deben tener identificadores positivos.");
        if (entrada.Proveedores.Distinct().Count() != entrada.Proveedores.Count)
            throw Error("No se puede repetir un proveedor.", HttpStatusCode.Conflict);
        var cliente = entrada.DatosCliente is null ? null : new ClienteSolicitudDTO
        {
            Nombre = entrada.DatosCliente.Nombre.Trim(), Identificacion = Limpiar(entrada.DatosCliente.Identificacion),
            Direccion = Limpiar(entrada.DatosCliente.Direccion), Telefono = Limpiar(entrada.DatosCliente.Telefono), Correo = Limpiar(entrada.DatosCliente.Correo)
        };
        var datos = new SolicitudGuardar
        {
            NumeroSolicitud = entrada.NumeroSolicitud.Trim(),
            FechaSolicitud = (entrada.FechaSolicitud ?? throw Error("La fecha es obligatoria.")).ToDateTime(TimeOnly.MinValue),
            FechaLimiteRespuesta = entrada.FechaLimiteRespuesta?.ToDateTime(TimeOnly.MinValue),
            DatosClienteOriginalJson = cliente is null ? null : JsonSerializer.Serialize(cliente, JsonWeb),
            Observaciones = Limpiar(entrada.Observaciones),
            LineasJson = JsonSerializer.Serialize(entrada.Lineas.Select(x => new
            {
                x.NumeroLinea, x.IdProducto, x.IdPresentacionProducto, x.CantidadEmpaques,
                x.PermiteAlternativas, Observaciones = Limpiar(x.Observaciones)
            }), JsonWeb),
            ProveedoresJson = JsonSerializer.Serialize(entrada.Proveedores)
        };
        var guardado = await repositorio.GuardarBorradorAsync(id, datos, cancelacion);
        return await ObtenerAsync(guardado, cancelacion);
    }

    public async Task<SolicitudRespuestaDTO> ObtenerAsync(long id, CancellationToken cancelacion)
    {
        Id(id);
        return Mapear(await repositorio.ObtenerAsync(id, cancelacion));
    }

    public async Task<PaginaRespuesta<SolicitudListadoDTO>> ListarAsync(SolicitudConsultaDTO consulta, CancellationToken cancelacion)
    {
        ValidacionCatalogo.Validar(consulta);
        var filas = await repositorio.ListarAsync(consulta.Estado, Limpiar(consulta.Buscar), consulta.Pagina, consulta.TamanoPagina, cancelacion);
        return new(filas.Select(x => new SolicitudListadoDTO
        {
            IdSolicitudCotizacion = x.IdSolicitudCotizacion, NumeroSolicitud = x.NumeroSolicitud, VersionSolicitud = x.VersionSolicitud,
            FechaSolicitud = DateOnly.FromDateTime(x.FechaSolicitud), FechaLimiteRespuesta = x.FechaLimiteRespuesta is null ? null : DateOnly.FromDateTime(x.FechaLimiteRespuesta.Value),
            Estado = x.Estado, CantidadLineas = x.CantidadLineas, CantidadProveedores = x.CantidadProveedores
        }).ToList(), filas.Count == 0 ? 0 : filas[0].TotalRegistros, consulta.Pagina, consulta.TamanoPagina);
    }

    public async Task<SolicitudRespuestaDTO> EmitirAsync(long id, CancellationToken cancelacion)
    {
        Id(id);
        var solicitud = await repositorio.ObtenerAsync(id, cancelacion);
        if (solicitud.Estado != "Borrador") throw Error("Solo se puede emitir un borrador.", HttpStatusCode.Conflict);
        if (solicitud.Lineas.Count == 0 || solicitud.Destinatarios.Count == 0 || string.IsNullOrWhiteSpace(TextoCliente(solicitud, "nombre")))
            throw Error("Para emitir se necesitan renglones, proveedores y nombre del cliente.");
        await repositorio.EmitirAsync(id, cancelacion);
        return await ObtenerAsync(id, cancelacion);
    }

    public async Task<SolicitudRespuestaDTO> CrearRevisionAsync(long id, CancellationToken cancelacion)
    {
        Id(id);
        return await ObtenerAsync(await repositorio.CrearRevisionAsync(id, cancelacion), cancelacion);
    }

    public async Task<SolicitudRespuestaDTO> CambiarEstadoAsync(long id, SolicitudEstadoDTO entrada, CancellationToken cancelacion)
    {
        Id(id); ValidacionCatalogo.Validar(entrada);
        await repositorio.CambiarEstadoAsync(id, entrada.Estado, cancelacion);
        return await ObtenerAsync(id, cancelacion);
    }

    private static SolicitudDestinatario Destinatario(Solicitud solicitud, long id)
    {
        Id(id);
        return solicitud.Destinatarios.SingleOrDefault(x => x.IdSolicitudCotizacionProveedor == id)
            ?? throw Error("El destinatario no pertenece a la solicitud.", HttpStatusCode.NotFound);
    }

    private static IdentidadDocumentoSolicitud Identidad(Solicitud s, SolicitudDestinatario d) => new(s.IdSolicitudCotizacion, s.VersionSolicitud, d.IdSolicitudCotizacionProveedor);
    private static string NombreArchivo(Solicitud s, SolicitudDestinatario d) => $"Solicitud-{s.IdSolicitudCotizacion}-v{s.VersionSolicitud}-dest-{d.IdSolicitudCotizacionProveedor}.pdf";
    private static DocumentoRespuestaDTO DocumentoRespuesta(Documento d) => new(d.IdDocumento, d.NombreOriginal, d.TamanoBytes, Convert.ToHexString(d.Sha256), d.VersionPlantilla, Utc(d.FechaRegistro));

    public async Task<DocumentoRespuestaDTO> GenerarDocumentoAsync(long id, long idDestinatario, CancellationToken cancelacion)
    {
        Id(id);
        var solicitud = await repositorio.ObtenerAsync(id, cancelacion);
        var destino = Destinatario(solicitud, idDestinatario);
        if (destino.IdDocumentoEnviado is not null)
        {
            var original = await repositorio.ObtenerDocumentoAsync(destino.IdDocumentoEnviado.Value, cancelacion);
            await almacen.LeerVerificadoAsync(Identidad(solicitud, destino), original, cancelacion);
            return DocumentoRespuesta(original);
        }
        if (solicitud.Estado != "Emitida") throw Error("Emita la solicitud antes de generar su PDF.", HttpStatusCode.Conflict);
        cancelacion.ThrowIfCancellationRequested();
        var contenido = generador.Generar(solicitud, destino);
        var archivo = await almacen.GuardarAsync(Identidad(solicitud, destino), contenido, cancelacion);
        long? idDocumento;
        try
        {
            idDocumento = await repositorio.RegistrarDocumentoAsync(id, idDestinatario, NombreArchivo(solicitud, destino), generador.VersionPlantilla, archivo, cancelacion);
        }
        catch
        {
            // No borrar: una desconexion durante COMMIT puede ocultar una confirmacion exitosa.
            logger.LogWarning("Se conserva archivo {Clave} para comprobar su registro tras un fallo SQL.", archivo.Clave);
            throw;
        }
        if (idDocumento is null)
        {
            try { await almacen.EliminarNoRegistradoAsync(archivo.Clave); }
            catch (Exception ex) { logger.LogWarning(ex, "Archivo sin registro pendiente de limpieza: {Clave}.", archivo.Clave); }
            var actual = await repositorio.ObtenerAsync(id, cancelacion);
            var registrado = Destinatario(actual, idDestinatario).IdDocumentoEnviado
                ?? throw Error("No se pudo recuperar el documento asignado. Consulte la solicitud.", HttpStatusCode.Conflict);
            var original = await repositorio.ObtenerDocumentoAsync(registrado, cancelacion);
            await almacen.LeerVerificadoAsync(Identidad(actual, Destinatario(actual, idDestinatario)), original, cancelacion);
            return DocumentoRespuesta(original);
        }
        return DocumentoRespuesta(await repositorio.ObtenerDocumentoAsync(idDocumento.Value, cancelacion));
    }

    public async Task<ArchivoDocumentoDescarga> DescargarDocumentoAsync(long id, long idDestinatario, CancellationToken cancelacion)
    {
        Id(id);
        var solicitud = await repositorio.ObtenerAsync(id, cancelacion);
        var destino = Destinatario(solicitud, idDestinatario);
        var idDocumento = destino.IdDocumentoEnviado ?? throw Error("El destinatario aún no tiene un PDF generado.", HttpStatusCode.NotFound);
        var documento = await repositorio.ObtenerDocumentoAsync(idDocumento, cancelacion);
        return new(await almacen.LeerVerificadoAsync(Identidad(solicitud, destino), documento, cancelacion), documento.NombreOriginal);
    }

    public async Task<SolicitudRespuestaDTO> RegistrarEnvioAsync(long id, long idDestinatario, SolicitudEnvioDTO entrada, CancellationToken cancelacion)
    {
        Id(id); ValidacionCatalogo.Validar(entrada);
        var solicitud = await repositorio.ObtenerAsync(id, cancelacion);
        var destino = Destinatario(solicitud, idDestinatario);
        var documento = destino.IdDocumentoEnviado ?? throw Error("Genere el PDF antes de registrar el envío.", HttpStatusCode.Conflict);
        var fecha = entrada.FechaEnvio ?? reloj.GetUtcNow();
        if (fecha > reloj.GetUtcNow() || (solicitud.FechaEmision is not null && fecha < Utc(solicitud.FechaEmision.Value)))
            throw Error("La fecha de envío debe estar entre la emisión y el momento actual.");
        var meta = await repositorio.ObtenerDocumentoAsync(documento, cancelacion);
        await almacen.LeerVerificadoAsync(Identidad(solicitud, destino), meta, cancelacion);
        await repositorio.RegistrarEnvioAsync(id, idDestinatario, documento, fecha.UtcDateTime, cancelacion);
        return await ObtenerAsync(id, cancelacion);
    }

    public static string? TextoCliente(Solicitud s, string campo)
    {
        if (s.DatosClienteOriginalJson is null) return null;
        using var json = JsonDocument.Parse(s.DatosClienteOriginalJson);
        return json.RootElement.ValueKind == JsonValueKind.Object && json.RootElement.TryGetProperty(campo, out var valor)
            && valor.ValueKind is not (JsonValueKind.Null or JsonValueKind.Undefined) ? valor.ToString() : null;
    }

    private static DateTimeOffset Utc(DateTime fecha) => new(DateTime.SpecifyKind(fecha, DateTimeKind.Utc));
    private static DateTimeOffset? Utc(DateTime? fecha) => fecha is null ? null : Utc(fecha.Value);
    private static SolicitudRespuestaDTO Mapear(Solicitud s) => new()
    {
        IdSolicitudCotizacion = s.IdSolicitudCotizacion, NumeroSolicitud = s.NumeroSolicitud, VersionSolicitud = s.VersionSolicitud,
        IdSolicitudAnterior = s.IdSolicitudAnterior, FechaSolicitud = DateOnly.FromDateTime(s.FechaSolicitud),
        FechaLimiteRespuesta = s.FechaLimiteRespuesta is null ? null : DateOnly.FromDateTime(s.FechaLimiteRespuesta.Value), Estado = s.Estado,
        DatosCliente = s.DatosClienteOriginalJson is null ? null : JsonSerializer.Deserialize<JsonElement>(s.DatosClienteOriginalJson),
        Observaciones = s.Observaciones, FechaEmision = Utc(s.FechaEmision), FechaCreacion = Utc(s.FechaCreacion), FechaModificacion = Utc(s.FechaModificacion),
        Lineas = s.Lineas.Select(x => new SolicitudLineaDTO
        {
            IdSolicitudCotizacionDetalle = x.IdSolicitudCotizacionDetalle,
            IdSolicitudCotizacion = x.IdSolicitudCotizacion,
            NumeroLinea = x.NumeroLinea,
            IdProducto = x.IdProducto,
            IdPresentacionProducto = x.IdPresentacionProducto,
            CantidadEmpaquesSolicitada = x.CantidadEmpaquesSolicitada,
            NombreProductoOriginal = x.NombreProductoOriginal,
            MarcaOriginal = x.MarcaOriginal,
            PresentacionOriginal = x.PresentacionOriginal,
            ContenidoEmpaqueOriginal = x.ContenidoEmpaqueOriginal,
            IdUnidadMedidaOriginal = x.IdUnidadMedidaOriginal,
            CodigoUnidadOriginal = x.CodigoUnidadOriginal,
            TipoBaseOriginal = x.TipoBaseOriginal,
            FactorConversionOriginal = x.FactorConversionOriginal,
            ContenidoNormalizadoOriginal = x.ContenidoNormalizadoOriginal,
            PermiteAlternativas = x.PermiteAlternativas,
            Observaciones = x.Observaciones,
        }).ToList(),
        Destinatarios = s.Destinatarios.Select(x => new SolicitudDestinatarioDTO
        {
            IdSolicitudCotizacionProveedor = x.IdSolicitudCotizacionProveedor,
            IdSolicitudCotizacion = x.IdSolicitudCotizacion,
            IdProveedor = x.IdProveedor,
            NombreProveedor = x.NombreProveedor,
            IdDocumentoGenerado = x.IdDocumentoEnviado,
            Estado = x.Estado,
            FechaEnvio = Utc(x.FechaEnvio),
            FechaRespuesta = Utc(x.FechaRespuesta),
            Observaciones = x.Observaciones,
            CantidadRespuestas = x.CantidadRespuestas,
        }).ToList()
    };
}
