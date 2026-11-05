using System.Data;

namespace Control_Fertilizantes_Backend.Infraestructura.Persistencia
{
    public interface IConexionBD
    {
        IDbConnection ObtenerConexion();
    }
}
