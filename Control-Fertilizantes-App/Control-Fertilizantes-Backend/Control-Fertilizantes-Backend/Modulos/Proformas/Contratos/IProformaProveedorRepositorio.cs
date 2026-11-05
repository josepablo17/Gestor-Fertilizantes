using Control_Fertilizantes_Backend.Modulos.Proformas.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Proformas.DTOs.Salidas;
namespace Control_Fertilizantes_Backend.Modulos.Proformas.Contratos
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
