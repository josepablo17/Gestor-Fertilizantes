using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using Control_Fertilizantes_Backend.Comun.Errores;
using Control_Fertilizantes_Backend.Comun.Paginacion;
using Control_Fertilizantes_Backend.Comun.Validacion;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.Contratos;
using Control_Fertilizantes_Backend.Modulos.Documentos.Contratos;
using Control_Fertilizantes_Backend.Modulos.Documentos.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Documentos.Modelos;
using Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Contratos;
using Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Modelos;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Contratos;
using Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Modelos;
using static Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Servicios.PreparadorBorradorRespuesta;

namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Servicios;

public sealed class RespuestaCotizacionServicio(
    IRespuestaCotizacionRepositorio repositorio, ISolicitudRepositorio solicitudes,
    IPresentacionProductoRepositorio presentaciones, IAlmacenDocumentos almacen,
    ILectorRespuestaPdf lector, ILogger<RespuestaCotizacionServicio> logger)
{
    public async Task<RespuestaCotizacionDTO> RecibirAsync(long idSolicitud, long idDestinatario, string nombreArchivo,
        Stream contenido, long longitud, CancellationToken ct)
    {
        var (solicitud, destino) = await ObtenerDestinatarioAsync(idSolicitud, idDestinatario, ct);
        if (solicitud.Estado != "Emitida" || solicitud.Lineas.Count is 0 or > 100 ||
            destino.Estado == "Cancelada")
            throw new ReglaNegocio("La recepción requiere un destinatario vigente de una solicitud emitida de hasta 100 renglones.", HttpStatusCode.Conflict);

        var nombre = Path.GetFileName(nombreArchivo.Replace('\\', '/')).Trim();
        if (nombre.Length is 0 or > 255 || nombre.Any(char.IsControl))
            throw new ReglaNegocio("El nombre del archivo debe contener de 1 a 255 caracteres válidos.");
        if (longitud is <= 0 or > LimitesPdf.Bytes)
            throw new ReglaNegocio("Adjunte un PDF de hasta 10 MiB.");
        var bytes = new byte[(int)longitud];
        try { await contenido.ReadExactlyAsync(bytes, ct); }
        catch (EndOfStreamException) { throw new ReglaNegocio("No se pudo leer el archivo completo."); }

        var original = destino.IdDocumentoEnviado is long idOriginal ? await solicitudes.ObtenerDocumentoAsync(idOriginal, ct) : null;
        var extraccion = lector.Leer(bytes, solicitud, destino, original?.Origen == "Generado" ? original.VersionPlantilla : null);
        var borrador = Preparar(solicitud, extraccion);
        var identidad = new IdentidadDocumentoSolicitud(idSolicitud, solicitud.VersionSolicitud, idDestinatario);
        var archivo = await almacen.GuardarRecibidoAsync(identidad, bytes, ct);
        int id;
        try { id = await repositorio.RegistrarAsync(idDestinatario, nombre, archivo, borrador, ct); }
        catch (ConfirmacionRespuestaIncierta)
        {
            logger.LogWarning("Confirmación SQL incierta. Se conserva el archivo recibido {Clave}.", archivo.Clave);
            throw;
        }
        catch
        {
            try { await almacen.EliminarNoRegistradoAsync(archivo.Clave); }
            catch (Exception error) { logger.LogWarning(error, "No se pudo retirar el archivo sin registro {Clave}.", archivo.Clave); }
            throw;
        }
        return await ObtenerAsync(id, ct);
    }

    public async Task<PaginaRespuesta<RespuestaResumenDTO>> ListarAsync(long idSolicitud, long idDestinatario, int pagina, int tamano, CancellationToken ct)
    {
        if (pagina < 1 || tamano is < 1 or > 200) throw new ReglaNegocio("La paginación está fuera del rango admitido.");
        var (_, destino) = await ObtenerDestinatarioAsync(idSolicitud, idDestinatario, ct);
        var filas = await repositorio.ListarAsync(idSolicitud, destino.IdProveedor, pagina, tamano, ct);
        return new(filas.Select(Resumen).ToList(), filas.FirstOrDefault()?.TotalRegistros ?? 0, pagina, tamano);
    }

    public async Task<RespuestaCotizacionDTO> ObtenerAsync(int id, CancellationToken ct)
    {
        Id(id);
        var respuesta = await repositorio.ObtenerAsync(id, ct);
        var h = respuesta.Cabecera;
        DocumentoRespuestaDTO? documento = null;
        ImportacionRespuestaDTO? importacion = null;
        if (h.IdDocumentoOrigen is long idDocumento)
        {
            var d = await solicitudes.ObtenerDocumentoAsync(idDocumento, ct);
            documento = new(d.IdDocumento, d.NombreOriginal, d.TamanoBytes, Convert.ToHexString(d.Sha256), d.VersionPlantilla, Utc(d.FechaRegistro));
            if (h.IdImportacionDocumento is long idImportacion &&
                await repositorio.ObtenerImportacionAsync(idDocumento, idImportacion, ct) is { } i)
                importacion = new(i.IdImportacionDocumento, i.VersionLector, i.Metodo, i.Estado,
                    Utc(i.FechaImportacion), LeerJson(i.DatosExtraidosJson), LeerJson(i.AdvertenciasJson));
        }

        return new(Resumen(h), new CabeceraRespuestaDTO(
            h.NumeroProforma,
            Fecha(h.FechaProforma),
            Fecha(h.FechaVencimiento),
            h.DiasCredito,
            h.TipoDocumento,
            h.Moneda,
            h.NombreProveedorPdf,
            h.NombreNegocio,
            h.RazonSocial,
            h.Cedula,
            h.Telefono,
            h.Vendedor,
            h.Subtotal,
            h.Descuento,
            h.Iva,
            h.OtrosCargos,
            h.Total,
            LeerJson(h.DatosProveedorOriginalJson),
            LeerJson(h.DatosClienteOriginalJson),
            h.CondicionesPago,
            h.CondicionesEntrega,
            h.Observaciones),
            respuesta.Lineas.Select(Linea).ToArray(), documento, importacion, respuesta.Historial.Select(x =>
                new CambioRespuestaDTO(x.IdCambioCotizacion, x.IdProformaProveedorDetalle, x.Origen,
                    x.Motivo, Utc(x.FechaCambio), JsonSerializer.Deserialize<JsonElement>(x.CambiosJson))).ToArray());
    }

    public async Task<ArchivoDocumentoDescarga> DescargarAsync(int id, CancellationToken ct)
    {
        Id(id);
        var h = (await repositorio.ObtenerAsync(id, ct)).Cabecera;
        var idDocumento = h.IdDocumentoOrigen ?? throw new ReglaNegocio("La respuesta no tiene PDF de origen.", HttpStatusCode.NotFound);
        var documento = await solicitudes.ObtenerDocumentoAsync(idDocumento, ct);
        var identidad = new IdentidadDocumentoSolicitud(h.IdSolicitudCotizacion, h.VersionSolicitud, h.IdSolicitudCotizacionProveedor);
        return new(await almacen.LeerRecibidoVerificadoAsync(identidad, documento, ct), documento.NombreOriginal);
    }

    public async Task<RespuestaCotizacionDTO> AjustarCabeceraAsync(int id, AjustarCabeceraRespuestaDTO entrada, CancellationToken ct)
    {
        Id(id);
        ValidacionCatalogo.Validar(entrada);
        var c = entrada.Cabecera;
        ValidacionCatalogo.Validar(c);
        if (c.FechaVencimiento < c.FechaProforma) throw new ReglaNegocio("El vencimiento no puede ser anterior a la fecha de la proforma.");
        if (c.Moneda is not null && !Regex.IsMatch(c.Moneda, @"\A[A-Z]{3}\z"))
            throw new ReglaNegocio("Indique una moneda de tres letras mayúsculas.");
        ValidarObjeto(c.DatosProveedorOriginal);
        ValidarObjeto(c.DatosClienteOriginal);
        var datos = new CabeceraGuardarRespuesta
        {
            NumeroProforma = Limpiar(c.NumeroProforma),
            FechaProforma = c.FechaProforma,
            FechaVencimiento = c.FechaVencimiento,
            DiasCredito = c.DiasCredito,
            TipoDocumento = Limpiar(c.TipoDocumento),
            Moneda = Limpiar(c.Moneda),
            NombreProveedorPdf = Limpiar(c.NombreProveedorPdf),
            NombreNegocio = Limpiar(c.NombreNegocio),
            RazonSocial = Limpiar(c.RazonSocial),
            Cedula = Limpiar(c.Cedula),
            Telefono = Limpiar(c.Telefono),
            Vendedor = Limpiar(c.Vendedor),
            Subtotal = c.Subtotal,
            Descuento = c.Descuento,
            Iva = c.Iva,
            OtrosCargos = c.OtrosCargos,
            Total = c.Total,
            DatosProveedorOriginal = c.DatosProveedorOriginal,
            DatosClienteOriginal = c.DatosClienteOriginal,
            CondicionesPago = Limpiar(c.CondicionesPago),
            CondicionesEntrega = Limpiar(c.CondicionesEntrega),
            Observaciones = Limpiar(c.Observaciones)
        };
        await EditableAsync(id, ct);
        await repositorio.AjustarCabeceraAsync(id, datos, entrada.Motivo.Trim(), ct);
        return await ObtenerAsync(id, ct);
    }

    public async Task<RespuestaCotizacionDTO> GuardarLineaAsync(int id, int? idLinea, AjustarLineaRespuestaDTO entrada, CancellationToken ct)
    {
        ValidacionCatalogo.Validar(entrada);
        ValidacionCatalogo.Validar(entrada.Linea);
        var actual = await EditableAsync(id, ct);
        if (idLinea is int detalle) ObtenerLinea(actual, detalle);
        else if (actual.Lineas.Count >= 200) throw new ReglaNegocio("La respuesta admite hasta 200 renglones.");

        var solicitud = await solicitudes.ObtenerAsync(actual.Cabecera.IdSolicitudCotizacion, ct);
        var datos = await PrepararLineaAsync(entrada.Linea, solicitud, ct);
        if (idLinea is int linea)
            await repositorio.AjustarLineaAsync(linea, datos, entrada.Motivo.Trim(), ct);
        else
            await repositorio.AgregarLineaAsync(id, datos, entrada.Motivo.Trim(), ct);
        return await ObtenerAsync(id, ct);
    }

    private async Task<LineaGuardarRespuesta> PrepararLineaAsync(LineaRespuestaEntradaDTO l, Solicitud solicitud, CancellationToken ct)
    {
        if (l.IdSolicitudDetalle is <= 0 || l.NumeroLinea is <= 0 || l.IdPresentacionProducto is <= 0)
            throw new ReglaNegocio("Los identificadores y el número de renglón deben ser positivos.");
        if (l.EstadoOferta is not ("Cotizada" or "SinCotizar" or "NoDisponible") ||
            l.TipoOferta is not ("Solicitada" or "Alternativa" or "Adicional") ||
            l.BaseTotalLinea is not ("Bruto" or "NetoSinImpuestos" or "ConImpuestos" or "SinDefinir"))
            throw new ReglaNegocio("El estado, tipo de oferta o base del total no es válido.");
        if (l.DescuentoPorcentaje > 100) throw new ReglaNegocio("El descuento porcentual no puede superar 100.");
        if (l.EstadoOferta != "Cotizada" && (l.CantidadEmpaques is not null || l.PrecioUnitario is not null || l.TotalLinea is not null ||
            l.DescuentoMonto is not null || l.DescuentoPorcentaje is not null || l.ImpuestoMonto is not null || l.BaseTotalLinea != "SinDefinir"))
            throw new ReglaNegocio("Un renglón sin oferta debe dejar vacíos la cantidad, los importes y el descuento.");

        var pedida = solicitud.Lineas.SingleOrDefault(x => x.IdSolicitudCotizacionDetalle == l.IdSolicitudDetalle);
        if ((l.TipoOferta == "Adicional" && l.IdSolicitudDetalle is not null) || (l.TipoOferta != "Adicional" && pedida is null))
            throw new ReglaNegocio("Seleccione un renglón de esta solicitud para ofertas solicitadas o alternativas. Las adicionales no se vinculan.");
        if (l.TipoOferta == "Alternativa" && (pedida?.PermiteAlternativas != true || Limpiar(l.MotivoAlternativa) is null))
            throw new ReglaNegocio("La solicitud debe permitir alternativas y se debe indicar el motivo de la oferta alternativa.");

        var datos = new LineaGuardarRespuesta
        {
            IdSolicitudDetalle = l.IdSolicitudDetalle, NumeroLinea = l.NumeroLinea, Codigo = Limpiar(l.Codigo), Descripcion = Limpiar(l.Descripcion),
            TipoOferta = l.TipoOferta, EstadoOferta = l.EstadoOferta, BaseTotalLinea = l.BaseTotalLinea, CantidadEmpaques = l.CantidadEmpaques,
            PrecioUnitario = l.PrecioUnitario, DescuentoPorcentaje = l.DescuentoPorcentaje, TotalLinea = l.TotalLinea,
            DescuentoMonto = l.DescuentoMonto, ImpuestoMonto = l.ImpuestoMonto, MotivoAlternativa = Limpiar(l.MotivoAlternativa), Observacion = Limpiar(l.Observacion)
        };
        if (l.TipoOferta == "Solicitada" && pedida is not null)
        {
            if (l.IdPresentacionProducto is not null && l.IdPresentacionProducto != pedida.IdPresentacionProducto)
                throw new ReglaNegocio("Una presentación distinta debe registrarse como alternativa.");
            if (l.EstadoOferta == "Cotizada") CopiarPresentacion(datos, pedida);
        }
        else if (l.IdPresentacionProducto is int idPresentacion)
        {
            ct.ThrowIfCancellationRequested();
            var presentacion = await presentaciones.ObtenerPorIdAsync(idPresentacion);
            if (presentacion?.Activo != true)
                throw new ReglaNegocio("Seleccione una presentación activa del catálogo.");
            CopiarPresentacion(datos, presentacion);
        }
        return datos;
    }

    public async Task<RespuestaCotizacionDTO> RevisarLineaAsync(int id, int idLinea, MotivoRespuestaDTO entrada, CancellationToken ct)
    {
        ValidacionCatalogo.Validar(entrada);
        var linea = ObtenerLinea(await EditableAsync(id, ct), idLinea);
        if (linea.EstadoOferta == "Cotizada" && (linea.Cantidad is null || linea.PrecioUnitario is null || linea.TotalLinea is null ||
            linea.NumeroLineaDocumento is null || linea.DescripcionProveedor is null || linea.IdPresentacionProducto is null || linea.BaseTotalLinea == "SinDefinir"))
            throw new ReglaNegocio("Complete descripción, número, presentación, cantidad, precio, total y base antes de confirmar la línea.");
        await repositorio.RevisarLineaAsync(idLinea, entrada.Motivo.Trim(), ct);
        return await ObtenerAsync(id, ct);
    }

    public async Task<RespuestaCotizacionDTO> ConciliarAsync(int id, ConciliarRespuestaDTO entrada, CancellationToken ct)
    {
        ValidacionCatalogo.Validar(entrada);
        var tolerancia = entrada.Tolerancia ?? 0.01m;
        if (entrada.EstadoConciliacion is not ("Conciliada" or "ConDiferencias") || tolerancia > 1)
            throw new ReglaNegocio("Indique Conciliada o ConDiferencias y una tolerancia entre 0 y 1.");
        await EditableAsync(id, ct);
        await repositorio.ConciliarAsync(id, entrada.EstadoConciliacion, entrada.Motivo.Trim(), tolerancia, ct);
        return await ObtenerAsync(id, ct);
    }

    public async Task<RespuestaCotizacionDTO> ValidarAsync(int id, CancellationToken ct)
    {
        var actual = await EditableAsync(id, ct);
        var h = actual.Cabecera;
        if (h.Moneda is null || h.FechaProforma is null || h.DatosClienteOriginalJson is null || h.DatosProveedorOriginalJson is null ||
            h.EstadoConciliacion == "Pendiente" || actual.Lineas.Count == 0 || actual.Lineas.Any(x => x.EstadoRevision != "Revisada"))
            throw new ReglaNegocio("Complete los datos de ambas partes y la fecha y moneda; revise todas las líneas y concilie los importes.", HttpStatusCode.Conflict);
        await repositorio.ValidarAsync(id, ct);
        return await ObtenerAsync(id, ct);
    }

    public async Task<RespuestaCotizacionDTO> CancelarAsync(int id, MotivoRespuestaDTO entrada, CancellationToken ct)
    {
        ValidacionCatalogo.Validar(entrada);
        await EditableAsync(id, ct);
        await repositorio.CancelarAsync(id, entrada.Motivo.Trim(), ct);
        return await ObtenerAsync(id, ct);
    }

    public async Task<RespuestaCotizacionDTO> CrearRevisionAsync(int id, CancellationToken ct)
    {
        Id(id);
        return await ObtenerAsync(await repositorio.CrearRevisionAsync(id, ct), ct);
    }

    private async Task<(Solicitud, SolicitudDestinatario)> ObtenerDestinatarioAsync(long idSolicitud, long idDestinatario, CancellationToken ct)
    {
        Id(idSolicitud);
        Id(idDestinatario);
        var solicitud = await solicitudes.ObtenerAsync(idSolicitud, ct);
        var destino = solicitud.Destinatarios.SingleOrDefault(x => x.IdSolicitudCotizacionProveedor == idDestinatario)
            ?? throw new ReglaNegocio("El destinatario no pertenece a la solicitud.", HttpStatusCode.NotFound);
        return (solicitud, destino);
    }

    private async Task<RespuestaCompleta> EditableAsync(int id, CancellationToken ct)
    {
        Id(id);
        var actual = await repositorio.ObtenerAsync(id, ct);
        if (actual.Cabecera.Estado is not ("Borrador" or "EnRevision"))
            throw new ReglaNegocio("La respuesta está finalizada. Cree una revisión para corregirla.", HttpStatusCode.Conflict);
        return actual;
    }

    private static LineaRespuestaRegistro ObtenerLinea(RespuestaCompleta actual, int id)
    {
        Id(id);
        return actual.Lineas.SingleOrDefault(x => x.IdProformaProveedorDetalle == id)
            ?? throw new ReglaNegocio("La línea no pertenece a la respuesta.", HttpStatusCode.NotFound);
    }

    private static void Id(long id)
    {
        if (id <= 0) throw new ReglaNegocio("El identificador debe ser mayor que cero.");
    }

    private static void ValidarObjeto(JsonElement? datos)
    {
        if (datos is { } d && (d.ValueKind != JsonValueKind.Object || d.GetRawText().Length > 4000))
            throw new ReglaNegocio("Los datos de cada parte deben ser un objeto JSON de hasta 4000 caracteres.");
    }

    private static DateOnly? Fecha(DateTime? fecha) => fecha is DateTime valor ? DateOnly.FromDateTime(valor) : null;
    private static DateTimeOffset Utc(DateTime fecha) => new(DateTime.SpecifyKind(fecha, DateTimeKind.Utc));
    private static JsonElement? LeerJson(string? json) => json is null ? null : JsonSerializer.Deserialize<JsonElement>(json);

    private static RespuestaResumenDTO Resumen(RespuestaRegistro h) => new(
        h.IdProformaProveedor, h.IdSolicitudCotizacion, h.IdSolicitudCotizacionProveedor, h.IdProveedor,
        h.VersionRespuesta, h.IdProformaAnterior, h.NombreProveedor, h.Estado, h.EstadoConciliacion,
        h.JustificacionConciliacion, Utc(h.FechaCreacion), h.FechaValidacion is DateTime fecha ? Utc(fecha) : null,
        h.NumeroProforma, h.Moneda, h.Total);

    private static LineaRespuestaDTO Linea(LineaRespuestaRegistro l) => new(
        l.IdProformaProveedorDetalle,
        l.EstadoRevision,
        l.IdSolicitudCotizacionDetalle,
        l.NumeroLineaDocumento,
        l.CodigoProveedor,
        l.DescripcionProveedor,
        l.IdProducto,
        l.IdPresentacionProducto,
        l.Cantidad,
        l.PrecioUnitario,
        l.DescuentoPorcentaje,
        l.TotalLinea,
        l.DescuentoMonto,
        l.ImpuestoMonto,
        l.TipoOferta,
        l.EstadoOferta,
        l.BaseTotalLinea,
        l.MotivoAlternativa,
        l.ObservacionValidacion,
        l.NombreProductoOriginal,
        l.MarcaOriginal,
        l.PresentacionOriginal,
        l.ContenidoEmpaqueOriginal,
        l.IdUnidadMedidaOriginal,
        l.CodigoUnidadOriginal,
        l.TipoBaseOriginal,
        l.FactorConversionOriginal,
        l.ContenidoNormalizadoOriginal);
}
