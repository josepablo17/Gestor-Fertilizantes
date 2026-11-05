using System.ComponentModel.DataAnnotations;
using System.Net;
using Control_Fertilizantes_Backend.Comun.Errores;

namespace Control_Fertilizantes_Backend.Comun.Validacion;

public static class ValidacionCatalogo
{
    public static void Validar(object? entrada)
    {
        if (entrada is null)
            throw new ReglaNegocio("Los datos son obligatorios.", HttpStatusCode.BadRequest);
        var errores = new List<ValidationResult>();
        if (!Validator.TryValidateObject(entrada, new ValidationContext(entrada), errores, true))
            throw new ReglaNegocio(string.Join(" ", errores.Select(x => x.ErrorMessage)), HttpStatusCode.BadRequest);
    }

    public static void Id(int id)
    {
        if (id <= 0) throw new ReglaNegocio("El identificador debe ser mayor que cero.", HttpStatusCode.BadRequest);
    }

    public static void IdOpcional(int? id)
    {
        if (id.HasValue) Id(id.Value);
    }

    public static string? Opcional(string? texto) => string.IsNullOrWhiteSpace(texto) ? null : texto.Trim();

    public static string? Busqueda(string? texto)
    {
        if (texto?.Length > 150)
            throw new ReglaNegocio("La búsqueda admite hasta 150 caracteres.", HttpStatusCode.BadRequest);
        return Opcional(texto);
    }
}
