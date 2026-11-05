namespace Control_Fertilizantes_Backend.Modulos.Compras.ComparacionHistorica.DTOs.Salidas
{
    public class ComparadorProveedorRespuestaDTO
    {
        public ComparadorProveedorResumenDTO Resumen { get; set; } = new ComparadorProveedorResumenDTO();
        public IEnumerable<ComparadorProveedorItemDTO> Proveedores { get; set; } = new List<ComparadorProveedorItemDTO>();
    }
}