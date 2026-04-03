using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Exceptions;
using Control_Fertilizantes_Backend.Interfaces;

namespace Control_Fertilizantes_Backend.Services
{
    public class ComparadorProveedorServicio : IComparadorProveedorServicio
    {
        private readonly IComparadorProveedorRepositorio _comparadorProveedorRepositorio;

        public ComparadorProveedorServicio(IComparadorProveedorRepositorio comparadorProveedorRepositorio)
        {
            _comparadorProveedorRepositorio = comparadorProveedorRepositorio;
        }

        public async Task<ComparadorProveedorRespuestaDTO> ObtenerComparativaAsync(
            int idProducto,
            int idPresentacionProducto,
            string? moneda,
            int? mesesAnalisis,
            bool soloAutorizados)
        {
            ValidarFiltros(idProducto, idPresentacionProducto, mesesAnalisis);

            var proveedores = (await _comparadorProveedorRepositorio.ObtenerComparativaAsync(
                idProducto,
                idPresentacionProducto,
                LimpiarMoneda(moneda),
                mesesAnalisis,
                soloAutorizados)).ToList();

            if (!proveedores.Any())
            {
                throw new ReglaNegocio("No se encontraron compras históricas para los filtros seleccionados.");
            }

            foreach (var proveedor in proveedores)
            {
                proveedor.TieneDatosSuficientes = proveedor.CantidadCompras >= 2;
                proveedor.PuntajeTotal = CalcularPuntajeTotal(proveedor, proveedores);
                proveedor.Evaluacion = ObtenerEvaluacion(proveedor);
                proveedor.Recomendacion = ObtenerRecomendacionBase(proveedor);
            }

            MarcarIndicadoresClave(proveedores);

            var resumen = ConstruirResumen(proveedores);

            return new ComparadorProveedorRespuestaDTO
            {
                Resumen = resumen,
                Proveedores = proveedores
            };
        }

        public async Task<ComparadorProveedorDetalleRespuestaDTO?> ObtenerDetalleProveedorAsync(
            int idProducto,
            int idPresentacionProducto,
            int idProveedor,
            string? moneda,
            int? mesesAnalisis)
        {
            if (idProveedor <= 0)
                throw new ReglaNegocio("El id del proveedor no es válido.");

            ValidarFiltros(idProducto, idPresentacionProducto, mesesAnalisis);

            var monedaLimpia = LimpiarMoneda(moneda);

            var comparativa = (await _comparadorProveedorRepositorio.ObtenerComparativaAsync(
                idProducto,
                idPresentacionProducto,
                monedaLimpia,
                mesesAnalisis,
                false)).ToList();

            var proveedor = comparativa.FirstOrDefault(p => p.IdProveedor == idProveedor);

            if (proveedor == null)
                return null;

            var historial = (await _comparadorProveedorRepositorio.ObtenerDetalleHistoricoProveedorAsync(
                idProducto,
                idPresentacionProducto,
                idProveedor,
                monedaLimpia,
                mesesAnalisis)).ToList();

            return new ComparadorProveedorDetalleRespuestaDTO
            {
                IdProveedor = proveedor.IdProveedor,
                NombreProveedor = proveedor.NombreProveedor,
                UltimoPrecioUnitario = proveedor.UltimoPrecioUnitario,
                PromedioHistorico = proveedor.PromedioHistorico,
                CantidadCompras = proveedor.CantidadCompras,
                VariacionPorcentual = proveedor.VariacionPorcentual,
                Tendencia = proveedor.Tendencia,
                Historial = historial
            };
        }

        // =========================
        // 🔧 MÉTODOS PRIVADOS
        // =========================

        private void ValidarFiltros(int idProducto, int idPresentacionProducto, int? mesesAnalisis)
        {
            if (idProducto <= 0)
                throw new ReglaNegocio("El id del producto no es válido.");

            if (idPresentacionProducto <= 0)
                throw new ReglaNegocio("El id de la presentación del producto no es válido.");

            if (mesesAnalisis.HasValue && mesesAnalisis.Value <= 0)
                throw new ReglaNegocio("El período de análisis no es válido.");
        }

        private string? LimpiarMoneda(string? moneda)
        {
            if (string.IsNullOrWhiteSpace(moneda))
                return null;

            return moneda.Trim().ToUpper();
        }

        private decimal CalcularPuntajeTotal(
            ComparadorProveedorItemDTO proveedor,
            List<ComparadorProveedorItemDTO> proveedores)
        {
            var mejorPrecio = proveedores.Min(p => p.UltimoPrecioUnitario);
            var peorPrecio = proveedores.Max(p => p.UltimoPrecioUnitario);

            var menorVariacion = proveedores.Min(p => p.VariacionPorcentual);
            var mayorVariacion = proveedores.Max(p => p.VariacionPorcentual);

            var mayorCantidadCompras = proveedores.Max(p => p.CantidadCompras);

            var puntajePrecio = CalcularPuntajeInvertido(
                proveedor.UltimoPrecioUnitario,
                mejorPrecio,
                peorPrecio) * 0.40m;

            var puntajeEstabilidad = CalcularPuntajeInvertido(
                proveedor.VariacionPorcentual,
                menorVariacion,
                mayorVariacion) * 0.25m;

            var puntajeExperiencia = CalcularPuntajeDirecto(
                proveedor.CantidadCompras,
                1,
                mayorCantidadCompras) * 0.15m;

            var puntajePromedio = CalcularPuntajePorPromedio(proveedor) * 0.10m;

            var puntajeRecencia = CalcularPuntajeRecencia(proveedor.FechaUltimaCompra) * 0.10m;

            var puntajeTotal = (puntajePrecio + puntajeEstabilidad + puntajeExperiencia + puntajePromedio + puntajeRecencia) * 100m;

            if (!proveedor.TieneDatosSuficientes)
                puntajeTotal -= 10m;

            if (puntajeTotal < 0)
                puntajeTotal = 0;

            return Math.Round(puntajeTotal, 2);
        }

        private decimal CalcularPuntajeInvertido(decimal valor, decimal minimo, decimal maximo)
        {
            if (maximo == minimo)
                return 1m;

            return 1m - ((valor - minimo) / (maximo - minimo));
        }

        private decimal CalcularPuntajeDirecto(decimal valor, decimal minimo, decimal maximo)
        {
            if (maximo == minimo)
                return 1m;

            return (valor - minimo) / (maximo - minimo);
        }

        private decimal CalcularPuntajeDirecto(int valor, int minimo, int maximo)
        {
            if (maximo == minimo)
                return 1m;

            return (decimal)(valor - minimo) / (maximo - minimo);
        }

        private decimal CalcularPuntajePorPromedio(ComparadorProveedorItemDTO proveedor)
        {
            if (proveedor.PromedioHistorico <= 0)
                return 0.50m;

            if (proveedor.DiferenciaVsPromedioPorcentual <= 0)
                return 1m;

            if (proveedor.DiferenciaVsPromedioPorcentual <= 5)
                return 0.75m;

            if (proveedor.DiferenciaVsPromedioPorcentual <= 10)
                return 0.50m;

            return 0.20m;
        }

        private decimal CalcularPuntajeRecencia(DateTime? fechaUltimaCompra)
        {
            if (!fechaUltimaCompra.HasValue)
                return 0.20m;

            var dias = (DateTime.Now.Date - fechaUltimaCompra.Value.Date).TotalDays;

            if (dias <= 30) return 1m;
            if (dias <= 90) return 0.80m;
            if (dias <= 180) return 0.60m;
            if (dias <= 365) return 0.40m;

            return 0.20m;
        }

        private string ObtenerEvaluacion(ComparadorProveedorItemDTO proveedor)
        {
            if (!proveedor.TieneDatosSuficientes)
                return "Datos insuficientes";

            if (proveedor.PuntajeTotal >= 85)
                return "Conveniente";

            if (proveedor.PuntajeTotal >= 70)
                return "Aceptable";

            if (proveedor.PuntajeTotal >= 55)
                return "Regular";

            return "Riesgoso";
        }

        private string ObtenerRecomendacionBase(ComparadorProveedorItemDTO proveedor)
        {
            if (!proveedor.TieneDatosSuficientes)
                return "Precio útil como referencia, pero con poco historial.";

            if (proveedor.DiferenciaVsPromedioPorcentual < 0)
                return "Su precio actual está por debajo de su promedio histórico.";

            if (proveedor.DiferenciaVsPromedioPorcentual > 0)
                return "Su precio actual está por encima de su promedio histórico.";

            return "Su precio actual está alineado con su comportamiento histórico.";
        }

        private void MarcarIndicadoresClave(List<ComparadorProveedorItemDTO> proveedores)
        {
            var proveedorMejorPrecio = proveedores
                .OrderBy(p => p.UltimoPrecioUnitario)
                .ThenByDescending(p => p.CantidadCompras)
                .FirstOrDefault();

            var proveedorMasEstable = proveedores
                .Where(p => p.TieneDatosSuficientes)
                .OrderBy(p => p.VariacionPorcentual)
                .ThenBy(p => p.UltimoPrecioUnitario)
                .FirstOrDefault();

            var proveedorRecomendado = proveedores
                .Where(p => p.TieneDatosSuficientes)
                .OrderByDescending(p => p.PuntajeTotal)
                .ThenBy(p => p.UltimoPrecioUnitario)
                .FirstOrDefault();

            if (proveedorRecomendado == null)
            {
                proveedorRecomendado = proveedores
                    .OrderByDescending(p => p.PuntajeTotal)
                    .ThenBy(p => p.UltimoPrecioUnitario)
                    .FirstOrDefault();
            }

            if (proveedorMejorPrecio != null)
            {
                proveedorMejorPrecio.EsMejorPrecio = true;
                proveedorMejorPrecio.Recomendacion = "Ofrece el mejor precio actual.";
            }

            if (proveedorMasEstable != null)
            {
                proveedorMasEstable.EsMasEstable = true;

                if (!proveedorMasEstable.EsMejorPrecio)
                    proveedorMasEstable.Recomendacion = "Es el proveedor más estable según el historial.";
            }

            if (proveedorRecomendado != null)
            {
                proveedorRecomendado.EsProveedorRecomendado = true;
                proveedorRecomendado.Recomendacion = "Es la mejor opción general según el análisis del sistema.";
            }
        }

        private ComparadorProveedorResumenDTO ConstruirResumen(List<ComparadorProveedorItemDTO> proveedores)
        {
            var mejorPrecio = proveedores
                .Where(p => p.EsMejorPrecio)
                .FirstOrDefault();

            var masEstable = proveedores
                .Where(p => p.EsMasEstable)
                .FirstOrDefault();

            var recomendado = proveedores
                .Where(p => p.EsProveedorRecomendado)
                .FirstOrDefault();

            var precioMinimo = proveedores.Min(p => p.UltimoPrecioUnitario);
            var precioMaximo = proveedores.Max(p => p.UltimoPrecioUnitario);
            var fechaUltimaActualizacion = proveedores.Max(p => p.FechaUltimaCompra);

            return new ComparadorProveedorResumenDTO
            {
                CantidadProveedoresAnalizados = proveedores.Count,

                IdProveedorMejorPrecio = mejorPrecio?.IdProveedor,
                NombreProveedorMejorPrecio = mejorPrecio?.NombreProveedor ?? string.Empty,
                MejorPrecio = mejorPrecio?.UltimoPrecioUnitario ?? 0,

                IdProveedorMasEstable = masEstable?.IdProveedor,
                NombreProveedorMasEstable = masEstable?.NombreProveedor ?? string.Empty,
                VariacionProveedorMasEstable = masEstable?.VariacionPorcentual ?? 0,

                IdProveedorRecomendado = recomendado?.IdProveedor,
                NombreProveedorRecomendado = recomendado?.NombreProveedor ?? string.Empty,
                PuntajeProveedorRecomendado = recomendado?.PuntajeTotal ?? 0,

                DiferenciaEntreMejorYPeorPrecio = Math.Round(precioMaximo - precioMinimo, 2),
                FechaUltimaActualizacion = fechaUltimaActualizacion,
                MensajeResumen = ConstruirMensajeResumen(recomendado, mejorPrecio, masEstable)
            };
        }

        private string ConstruirMensajeResumen(
            ComparadorProveedorItemDTO? recomendado,
            ComparadorProveedorItemDTO? mejorPrecio,
            ComparadorProveedorItemDTO? masEstable)
        {
            if (recomendado == null && mejorPrecio == null)
                return "No hay información suficiente para generar un resumen.";

            if (recomendado != null && mejorPrecio != null && recomendado.IdProveedor == mejorPrecio.IdProveedor)
            {
                return $"{recomendado.NombreProveedor} combina el mejor precio actual con la mejor evaluación general.";
            }

            if (recomendado != null && masEstable != null && recomendado.IdProveedor == masEstable.IdProveedor)
            {
                return $"{recomendado.NombreProveedor} destaca como la opción más estable y mejor valorada del análisis.";
            }

            if (recomendado != null)
            {
                return $"{recomendado.NombreProveedor} es la opción recomendada por el sistema según precio, estabilidad y respaldo histórico.";
            }

            return $"{mejorPrecio?.NombreProveedor} ofrece actualmente el precio más bajo entre los proveedores analizados.";
        }
    }
}