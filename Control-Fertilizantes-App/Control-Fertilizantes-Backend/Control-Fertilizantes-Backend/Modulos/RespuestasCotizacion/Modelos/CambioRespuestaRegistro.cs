namespace Control_Fertilizantes_Backend.Modulos.RespuestasCotizacion.Modelos;

public class CambioRespuestaRegistro
{
    public long IdCambioCotizacion { get; set; }
    public int? IdProformaProveedorDetalle { get; set; }
    public string Origen { get; set; } = "";
    public string CambiosJson { get; set; } = "{}";
    public string? Motivo { get; set; }
    public DateTime FechaCambio { get; set; }
}
