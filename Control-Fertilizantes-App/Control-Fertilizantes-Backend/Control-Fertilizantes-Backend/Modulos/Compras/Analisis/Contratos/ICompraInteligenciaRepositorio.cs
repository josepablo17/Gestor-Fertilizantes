using Control_Fertilizantes_Backend.Modulos.Compras.Analisis.DTOs.Salidas;
namespace Control_Fertilizantes_Backend.Modulos.Compras.Analisis.Contratos
{
    public interface ICompraInteligenciaRepositorio
    {
        Task<IEnumerable<CompraHistorialPrecioDTO>> ObtenerHistorialPreciosPorProductoAsync(int idProducto, int idPresentacionProducto);
        Task<CompraResumenInteligenteDTO?> ObtenerResumenInteligentePreciosAsync(int idProducto, int idPresentacionProducto);
        Task<CompraEvaluacionAutomaticaDTO?> EvaluarCompraAsync(int idCompra);
        Task<IEnumerable<CompraAlertaDTO>> ObtenerAlertasPorProductoAsync(int idProducto, int idPresentacionProducto);
    }
}
