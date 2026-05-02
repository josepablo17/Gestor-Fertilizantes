using Control_Fertilizantes_Backend.DTOs;

namespace Control_Fertilizantes_Backend.Interfaces
{
    public interface IProformaProveedorRepositorio
    {
        Task<int> InsertarAsync(GuardarProformaProveedorDTO proforma);

        Task<int> InsertarDetalleAsync(GuardarProformaProveedorDetalleDTO detalle);

        Task<ProformaProveedorRespuestaDTO?> ObtenerPorIdAsync(int idProformaProveedor);

        Task<IEnumerable<ProformaProveedorRespuestaDTO>> ListarAsync();

        Task<IEnumerable<ProformaProveedorDetalleRespuestaDTO>> ListarDetallesAsync(int idProformaProveedor);
    }
}
