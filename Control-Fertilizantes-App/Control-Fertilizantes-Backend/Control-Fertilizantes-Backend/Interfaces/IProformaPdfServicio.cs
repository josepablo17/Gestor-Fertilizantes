using Control_Fertilizantes_Backend.DTOs;
namespace Control_Fertilizantes_Backend.Interfaces
{
    public interface IProformaPdfServicio
    {
           Task<VistaPreviaProformaPdfDTO> ProcesarProformaPdfAsync(IFormFile archivoPdf);

    }
}
