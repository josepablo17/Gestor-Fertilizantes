namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.Modelos;

public class Marca
{
    public int IdMarca { get; set; }
    public required string Nombre { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
}
