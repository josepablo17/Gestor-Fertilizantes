using Control_Fertilizantes_Backend.Entities;
using Control_Fertilizantes_Backend.Interfaces;

using Dapper;
using System.Data;

namespace Control_Fertilizantes_Backend.Repositories
{
    public class UnidadMedidaRepositorio : IUnidadMedidaRepositorio
    {
        private readonly IConexionBD _conexionBD;

        public UnidadMedidaRepositorio(IConexionBD conexionBD)
        {
            _conexionBD = conexionBD;
        }

        public async Task<IEnumerable<UnidadMedida>> ListarAsync()
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var resultado = await conexion.QueryAsync<UnidadMedida>(
                "SP_UnidadesMedida_Listar",
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<UnidadMedida?> ObtenerPorIdAsync(int idUnidadMedida)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdUnidadMedida", idUnidadMedida);

            var resultado = await conexion.QueryFirstOrDefaultAsync<UnidadMedida>(
                "SP_UnidadMedida_ObtenerPorId",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<int> InsertarAsync(UnidadMedida unidadMedida)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@Codigo", unidadMedida.Codigo);
            parametros.Add("@Nombre", unidadMedida.Nombre);
            parametros.Add("@TipoBase", unidadMedida.TipoBase);
            parametros.Add("@FactorConversion", unidadMedida.FactorConversion);
            parametros.Add("@EsUnidadBase", unidadMedida.EsUnidadBase);

            var idUnidadMedida = await conexion.QueryFirstAsync<int>(
                "SP_UnidadMedida_Insertar",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return idUnidadMedida;
        }

        public async Task<bool> ActualizarAsync(UnidadMedida unidadMedida)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdUnidadMedida", unidadMedida.IdUnidadMedida);
            parametros.Add("@Codigo", unidadMedida.Codigo);
            parametros.Add("@Nombre", unidadMedida.Nombre);
            parametros.Add("@TipoBase", unidadMedida.TipoBase);
            parametros.Add("@FactorConversion", unidadMedida.FactorConversion);
            parametros.Add("@EsUnidadBase", unidadMedida.EsUnidadBase);

            var filasAfectadas = await conexion.QueryFirstAsync<int>(
                "SP_UnidadMedida_Actualizar",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return filasAfectadas > 0;
        }

        public async Task<bool> DesactivarAsync(int idUnidadMedida)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdUnidadMedida", idUnidadMedida);

            var filasAfectadas = await conexion.QueryFirstAsync<int>(
                "SP_UnidadMedida_Desactivar",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return filasAfectadas > 0;
        }
    }
}