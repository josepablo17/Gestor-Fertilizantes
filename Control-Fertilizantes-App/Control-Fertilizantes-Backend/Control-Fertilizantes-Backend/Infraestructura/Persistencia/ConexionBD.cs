using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;

namespace Control_Fertilizantes_Backend.Infraestructura.Persistencia;

public class ConexionBD : IConexionBD
{
    private readonly string _cadena;

    public ConexionBD(IOptions<OpcionesConexionSql> opciones)
    {
        _cadena = opciones.Value.Cadena;
    }

    public IDbConnection ObtenerConexion() => new SqlConnection(_cadena);
}