using Control_Fertilizantes_Backend.Modulos.Importaciones.DTOs.Entradas;
using Control_Fertilizantes_Backend.Modulos.Importaciones.DTOs.Salidas;
namespace Control_Fertilizantes_Backend.Modulos.Importaciones.Contratos
{
    public interface ICompraAutomaticaServicio
    {
        Task<VistaPreviaProformaValidadaDTO> ValidarVistaPreviaAsync(VistaPreviaProformaPdfDTO vistaPreviaPdf);
        Task<List<int>> ConfirmarComprasAutomaticasAsync(ConfirmarComprasAutomaticasDTO dto);
    }
}

