using Control_Fertilizantes_Backend.Interfaces;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Control_Fertilizantes_Backend.DataAccess
{
    public class ConexionBD : IConexionBD
    {
        private readonly IConfiguration _configuration;

        public ConexionBD(IConfiguration configuration) 
        {
            _configuration = configuration;
        }

        public IDbConnection ObtenerConexion()
        {
            return new SqlConnection(_configuration.GetConnectionString("ConexionSql"));
        }
    }
}
