using Control_Fertilizantes_Backend.DTOs;

namespace Control_Fertilizantes_Backend.Interfaces
{
    public interface ICompraAutomaticaServicio
    {
        Task<VistaPreviaProformaValidadaDTO> ValidarVistaPreviaAsync(VistaPreviaProformaPdfDTO vistaPreviaPdf);
        Task<List<int>> ConfirmarComprasAutomaticasAsync(ConfirmarComprasAutomaticasDTO dto);
    }
}

