using Control_Fertilizantes_Backend.DTOs;

namespace Control_Fertilizantes_Backend.Interfaces
{
    public interface ICompraAutomaticaRepositorio
    {
        Task<ProductoBusquedaDTO?> BuscarProductoParaCompraAutomaticaAsync(string descripcion);
        Task<ProveedorBusquedaDTO?> BuscarProveedorParaCompraAutomaticaAsync(
            string nombreNegocio,
            string razonSocial
            );
        Task<PresentacionBusquedaDTO?> BuscarPresentacionParaCompraAutomaticaAsync(int idProducto, string descripcionLinea);
        Task<int> InsertarCompraDesdeProformaAsync(
            int idProducto,
            int idProveedor,
            int idPresentacionProducto,
            DateTime fechaCompra,
            decimal cantidadComprada,
            decimal precioTotal,
            string moneda,
            string observaciones
            );

        Task<CompraAutomaticaEquivalenciaDTO?> BuscarEquivalenciaCompraAutomaticaAsync(string? codigoProveedor, string descripcionProveedor);

    }
}
