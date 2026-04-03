namespace Control_Fertilizantes_Backend.Entities
{
    public class Proveedor
    {
        public int IdProveedor {  get; set; }
        public string? Nombre { get; set; }
        public string? Contacto { get; set; }
        public string? Telefono { get; set; }
        public string? Correo { get; set; }
        public bool EsProveedorAutorizado { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaModificacion { get; set; }
    }
}
