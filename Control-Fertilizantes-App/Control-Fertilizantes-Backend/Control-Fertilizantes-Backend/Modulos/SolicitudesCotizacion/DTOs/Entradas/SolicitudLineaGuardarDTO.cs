using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Control_Fertilizantes_Backend.Comun.Validacion;
namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.DTOs.Entradas;
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class SolicitudLineaGuardarDTO
{
    [Range(1, int.MaxValue, ErrorMessage = "{0} debe ser mayor que cero.")] public int NumeroLinea { get; set; }
    [Range(1, int.MaxValue, ErrorMessage = "{0} debe ser mayor que cero.")] public int IdProducto { get; set; }
    [Range(1, int.MaxValue, ErrorMessage = "{0} debe ser mayor que cero.")] public int IdPresentacionProducto { get; set; }
    [DecimalSql(18, 4), JsonConverter(typeof(DecimalCatalogoJsonConverter))]
    public decimal CantidadEmpaques { get; set; }
    public bool PermiteAlternativas { get; set; } = true;
    [StringLength(1000, ErrorMessage = "{0} admite hasta {1} caracteres.")] public string? Observaciones { get; set; }
}
