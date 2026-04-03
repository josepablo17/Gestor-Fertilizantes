namespace Control_Fertilizantes_Backend.Entities
{
    public class PresentacionProducto
    {
        public int IdPresentacionProducto { get; set; }
        public int IdProducto { get; set; }
        public string? NombreProducto { get; set; }
        public string? Descripcion { get; set; }
        public decimal Cantidad { get; set; }
        public int IdUnidadMedida { get; set; }
        public string? NombreUnidadMedida { get; set; }
        public decimal CantidadNormalizada { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
    }
}
