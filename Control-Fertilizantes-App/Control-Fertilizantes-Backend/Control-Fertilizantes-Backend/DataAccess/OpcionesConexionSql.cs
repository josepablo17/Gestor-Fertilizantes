using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;

namespace Control_Fertilizantes_Backend.DataAccess;

public sealed class OpcionesConexionSql
{
    public string Cadena { get; set; } = string.Empty;
}

public sealed class ValidadorConexionSql : IValidateOptions<OpcionesConexionSql>
{
    public ValidateOptionsResult Validate(string? name, OpcionesConexionSql opciones)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(opciones.Cadena))
                return Error();
            var conexion = new SqlConnectionStringBuilder(opciones.Cadena);
            if (string.IsNullOrWhiteSpace(conexion.DataSource) ||
                string.IsNullOrWhiteSpace(conexion.InitialCatalog) ||
                new[] { "master", "model", "msdb", "tempdb" }.Contains(conexion.InitialCatalog, StringComparer.OrdinalIgnoreCase) ||
                conexion.Encrypt == SqlConnectionEncryptOption.Optional ||
                (!conexion.IntegratedSecurity &&
                    (string.IsNullOrWhiteSpace(conexion.UserID) || string.IsNullOrEmpty(conexion.Password))) ||
                string.Equals(conexion.UserID, "sa", StringComparison.OrdinalIgnoreCase))
                return Error();
            return ValidateOptionsResult.Success;
        }
        catch (ArgumentException)
        {
            return Error();
        }
    }

    private static ValidateOptionsResult Error() => ValidateOptionsResult.Fail(
        "Configure ConnectionStrings__ConexionSql con servidor, base de aplicación, cifrado y una cuenta de ejecución; no utilice sa. No se selecciona una instancia por defecto.");
}
