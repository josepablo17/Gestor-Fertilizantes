using Control_Fertilizantes_Backend.Modulos.Importaciones.DTOs.Salidas;
namespace Control_Fertilizantes_Backend.Modulos.Importaciones.Contratos
{
    public interface IProformaPdfServicio
    {
           Task<VistaPreviaProformaPdfDTO> ProcesarProformaPdfAsync(IFormFile archivoPdf);

    }
}
