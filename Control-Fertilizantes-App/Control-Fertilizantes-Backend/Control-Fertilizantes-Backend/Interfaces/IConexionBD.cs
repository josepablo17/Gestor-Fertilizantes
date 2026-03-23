using System.Data;

namespace Control_Fertilizantes_Backend.Interfaces
{
    public interface IConexionBD
    {
        IDbConnection ObtenerConexion();
    }
}
