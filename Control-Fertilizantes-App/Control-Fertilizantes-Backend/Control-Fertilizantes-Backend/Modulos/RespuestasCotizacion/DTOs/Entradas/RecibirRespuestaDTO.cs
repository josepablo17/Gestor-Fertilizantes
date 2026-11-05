using System.ComponentModel.DataAnnotations;

namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.DTOs.Entradas;

public sealed class RecibirRespuestaDTO
{
    [Required(ErrorMessage = "Adjunte el PDF que devolvió el proveedor.")]
    public IFormFile Archivo { get; init; } = null!;
}
