using Control_Fertilizantes_Backend.Modulos.Compras.ComparacionHistorica.DTOs.Salidas;
namespace Control_Fertilizantes_Backend.Modulos.Compras.ComparacionHistorica.Contratos
{
    public interface IComparadorProveedorServicio
    {
        Task<ComparadorProveedorRespuestaDTO> ObtenerComparativaAsync(
            int idProducto,
            int idPresentacionProducto,
            string? moneda,
            int? mesesAnalisis,
            bool soloAutorizados);

        Task<ComparadorProveedorDetalleRespuestaDTO?> ObtenerDetalleProveedorAsync(
            int idProducto,
            int idPresentacionProducto,
            int idProveedor,
            string? moneda,
            int? mesesAnalisis);
    }
}