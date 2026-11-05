namespace Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.Modelos;

// Datos normalizados para persistir; separados de las entradas HTTP y de las consultas.
public class MarcaGuardar
{
    public int IdMarca { get; set; }
    public required string Nombre { get; set; }
}
