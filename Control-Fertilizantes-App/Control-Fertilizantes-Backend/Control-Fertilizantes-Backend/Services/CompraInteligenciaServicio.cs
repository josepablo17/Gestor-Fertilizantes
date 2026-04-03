using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Exceptions;
using Control_Fertilizantes_Backend.Interfaces;

namespace Control_Fertilizantes_Backend.Services
{
    public class CompraInteligenciaServicio : ICompraInteligenciaServicio
    {
        private readonly ICompraInteligenciaRepositorio _compraInteligenciaRepositorio;

        public CompraInteligenciaServicio(ICompraInteligenciaRepositorio compraInteligenciaRepositorio)
        {
            _compraInteligenciaRepositorio = compraInteligenciaRepositorio;
        }

        public async Task<IEnumerable<CompraHistorialPrecioDTO>> ObtenerHistorialPreciosPorProductoAsync(int idProducto, int idPresentacionProducto)
        {
            ValidarIdsProductoPresentacion(idProducto, idPresentacionProducto);

            var historial = await _compraInteligenciaRepositorio.ObtenerHistorialPreciosPorProductoAsync(idProducto, idPresentacionProducto);

            return historial;
        }

        public async Task<CompraResumenInteligenteDTO?> ObtenerResumenInteligentePreciosAsync(int idProducto, int idPresentacionProducto)
        {
            ValidarIdsProductoPresentacion(idProducto, idPresentacionProducto);

            var resumen = await _compraInteligenciaRepositorio.ObtenerResumenInteligentePreciosAsync(idProducto, idPresentacionProducto);

            return resumen;
        }

        public async Task<CompraEvaluacionAutomaticaDTO?> EvaluarCompraAsync(int idCompra)
        {
            if (idCompra <= 0)
                throw new ReglaNegocio("El id de la compra no es válido.");

            var evaluacion = await _compraInteligenciaRepositorio.EvaluarCompraAsync(idCompra);

            return evaluacion;
        }

        public async Task<IEnumerable<CompraAlertaDTO>> ObtenerAlertasPorProductoAsync(int idProducto, int idPresentacionProducto)
        {
            ValidarIdsProductoPresentacion(idProducto, idPresentacionProducto);

            var alertas = await _compraInteligenciaRepositorio.ObtenerAlertasPorProductoAsync(idProducto, idPresentacionProducto);

            return alertas;
        }

        // =========================
        // 🔧 MÉTODOS PRIVADOS
        // =========================

        private void ValidarIdsProductoPresentacion(int idProducto, int idPresentacionProducto)
        {
            if (idProducto <= 0)
                throw new ReglaNegocio("El id del producto no es válido.");

            if (idPresentacionProducto <= 0)
                throw new ReglaNegocio("El id de la presentación del producto no es válido.");
        }
    }
}