namespace Control_Fertilizantes_Backend.DTOs
{
    public class ComparadorProveedorRespuestaDTO
    {
        public ComparadorProveedorResumenDTO Resumen { get; set; } = new ComparadorProveedorResumenDTO();
        public IEnumerable<ComparadorProveedorItemDTO> Proveedores { get; set; } = new List<ComparadorProveedorItemDTO>();
    }
}