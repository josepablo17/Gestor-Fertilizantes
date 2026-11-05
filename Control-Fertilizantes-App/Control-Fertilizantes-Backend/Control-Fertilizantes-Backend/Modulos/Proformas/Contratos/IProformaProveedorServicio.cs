using Control_Fertilizantes_Backend.Modulos.Proformas.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Proformas.DTOs.Salidas;
namespace Control_Fertilizantes_Backend.Modulos.Proformas.Contratos
{
    public interface IProformaProveedorServicio
    {
        Task<IEnumerable<ProformaProveedorRespuestaDTO>> ListarAsync();

        Task<ProformaProveedorRespuestaDTO?> ObtenerPorIdAsync(int idProformaProveedor);

        Task<ProformaProveedorRespuestaDTO> GuardarAsync(GuardarProformaProveedorDTO proforma);
    }
}
