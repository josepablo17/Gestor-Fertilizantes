namespace Control_Fertilizantes_Backend.Modulos.SolicitudesCotizacion.Modelos;
public class SolicitudListadoRegistro : Solicitud
{
    public long TotalRegistros { get; set; }
    public int CantidadLineas { get; set; }
    public int CantidadProveedores { get; set; }
}
