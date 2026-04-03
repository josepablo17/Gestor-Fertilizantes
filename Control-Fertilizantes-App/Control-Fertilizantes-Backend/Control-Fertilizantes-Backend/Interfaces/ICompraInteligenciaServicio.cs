using Control_Fertilizantes_Backend.DTOs;

namespace Control_Fertilizantes_Backend.Interfaces
{
    public interface ICompraInteligenciaServicio
    {
        Task<IEnumerable<CompraHistorialPrecioDTO>> ObtenerHistorialPreciosPorProductoAsync(int idProducto, int idPresentacionProducto);
        Task<CompraResumenInteligenteDTO?> ObtenerResumenInteligentePreciosAsync(int idProducto, int idPresentacionProducto);
        Task<CompraEvaluacionAutomaticaDTO?> EvaluarCompraAsync(int idCompra);
        Task<IEnumerable<CompraAlertaDTO>> ObtenerAlertasPorProductoAsync(int idProducto, int idPresentacionProducto);
    }
}
