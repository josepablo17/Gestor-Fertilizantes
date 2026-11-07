using Control_Fertilizantes_Backend.Modulos.Compras.Modelos;
using Control_Fertilizantes_Backend.Modulos.Presupuestos.DTOs.Entradas;
namespace Control_Fertilizantes_Backend.Modulos.Compras.Contratos
{
    public interface ICompraRepositorio
    {
        Task<IEnumerable<Compra>> ListarAsync();
        Task<Compra?> ObtenerPorIdAsync(int idCompra);
        Task<int> InsertarAsync(Compra compra, ImputacionCompraDTO? imputacion = null);
        Task<bool> ActualizarAsync(Compra compra);
        Task<IEnumerable<Compra>> HistorialPorProductoAsync(int idProducto);
        Task<Compra?> ObtenerUltimoPrecioAsync(int idProducto, int idPresentacionProducto,
            string moneda, DateOnly? fechaLimite, int? idCompraLimite, CancellationToken cancelacion);
    }
}
