using Control_Fertilizantes_Backend.Comun.Errores;
using Control_Fertilizantes_Backend.Comun.Validacion;
using Control_Fertilizantes_Backend.Modulos.Compras.Contratos;
using Control_Fertilizantes_Backend.Modulos.Compras.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Compras.DTOs.Salidas;

namespace Control_Fertilizantes_Backend.Modulos.Compras.Servicios;

public sealed class CompraDocumentoServicio(ICompraDocumentoRepositorio repositorio, TimeProvider reloj)
{
    public async Task<CompraDocumentoDTO> Registrar(CompraDocumentoCrearDTO datos, CancellationToken ct)
    {
        ValidacionCatalogo.Validar(datos);
        ValidarCabecera(datos);
        if (datos.IdOperacion == Guid.Empty) throw new ReglaNegocio("Falta el identificador de la operación.");
        for (var i = 0; i < datos.Lineas.Length; i++)
        {
            var linea = datos.Lineas[i];
            ValidarRenglon(linea);
            if (linea.ImputacionPresupuesto is { } imputacion)
            {
                ValidacionCatalogo.Validar(imputacion);
                foreach (var reparto in imputacion.Distribucion)
                {
                    if (reparto.IdPartidaPresupuesto <= 0 || reparto.IdCompromisoDetalle is <= 0)
                        throw new ReglaNegocio($"Revise las partidas del renglón {i + 1}.");
                    ValidarImporte(reparto.Monto);
                }
                if (imputacion.Distribucion.Select(x => x.IdPartidaPresupuesto).Distinct().Count() != imputacion.Distribucion.Length
                    || imputacion.Distribucion.Sum(x => x.Monto) != linea.PrecioTotal)
                    throw new ReglaNegocio($"El reparto presupuestario del renglón {i + 1} debe coincidir con su importe, sin repetir partidas.");
            }
        }
        return await repositorio.Obtener(await repositorio.Registrar(datos, ct), ct);
    }

    public async Task<CompraDocumentoDTO> ActualizarCabecera(long id, CompraCabeceraActualizarDTO datos, CancellationToken ct)
    {
        ValidacionCatalogo.Validar(datos);
        ValidarVersion(datos.Version);
        ValidarCabecera(datos);
        await repositorio.ActualizarCabecera(id, datos, ct);
        return await repositorio.Obtener(id, ct);
    }

    public async Task<CompraDocumentoDTO> ActualizarRenglon(long id, long idCompra, CompraRenglonActualizarDTO datos, CancellationToken ct)
    {
        ValidacionCatalogo.Validar(datos);
        ValidarVersion(datos.Version);
        ValidarRenglon(datos);
        await repositorio.ActualizarRenglon(id, idCompra, datos, ct);
        return await repositorio.Obtener(id, ct);
    }

    private void ValidarCabecera(CabeceraCompraEntradaDTO datos)
    {
        ValidacionCatalogo.Validar(datos);
        if (datos.FechaCompra == default || datos.FechaCompra > DateOnly.FromDateTime(reloj.GetLocalNow().DateTime))
            throw new ReglaNegocio("Indique una fecha de compra válida que no sea futura.");
    }

    private static void ValidarRenglon(CompraRenglonEntradaDTO datos)
    {
        ValidacionCatalogo.Validar(datos);
        if (datos.CantidadComprada <= 0 || datos.CantidadComprada > 99999999999999m || datos.CantidadComprada != decimal.Truncate(datos.CantidadComprada))
            throw new ReglaNegocio("La cantidad de empaques debe ser un entero positivo de hasta 14 cifras.");
        ValidarImporte(datos.PrecioTotal);
        if (decimal.Round(datos.PrecioTotal / datos.CantidadComprada, 6) is <= 0 or > 999999999999.999999m)
            throw new ReglaNegocio("El precio por empaque está fuera del rango admitido.");
    }

    private static void ValidarImporte(decimal importe)
    {
        if (importe is <= 0 or > 99999999999999.9999m || decimal.Round(importe, 4) != importe)
            throw new ReglaNegocio("Indique importes positivos de hasta 14 enteros y cuatro decimales.");
    }

    private static void ValidarVersion(byte[] version)
    {
        if (version.Length != 8) throw new ReglaNegocio("Falta una versión válida de la compra. Recargue la página.");
    }
}
