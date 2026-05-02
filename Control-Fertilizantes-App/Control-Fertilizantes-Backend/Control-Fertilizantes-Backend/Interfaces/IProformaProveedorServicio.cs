using Control_Fertilizantes_Backend.DTOs;

namespace Control_Fertilizantes_Backend.Interfaces
{
    public interface IProformaProveedorServicio
    {
        Task<IEnumerable<ProformaProveedorRespuestaDTO>> ListarAsync();

        Task<ProformaProveedorRespuestaDTO?> ObtenerPorIdAsync(int idProformaProveedor);

        Task<ProformaProveedorRespuestaDTO> GuardarAsync(GuardarProformaProveedorDTO proforma);
    }
}
