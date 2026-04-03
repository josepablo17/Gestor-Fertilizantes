using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Interfaces;
using Dapper;
using System.Data;

namespace Control_Fertilizantes_Backend.Repositories
{
    public class CompraInteligenciaRepositorio : ICompraInteligenciaRepositorio
    {
        private readonly IConexionBD _conexionBD;

        public CompraInteligenciaRepositorio(IConexionBD conexionBD)
        {
            _conexionBD = conexionBD;
        }

        public async Task<IEnumerable<CompraHistorialPrecioDTO>> ObtenerHistorialPreciosPorProductoAsync(int idProducto, int idPresentacionProducto)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProducto", idProducto);
            parametros.Add("@IdPresentacionProducto", idPresentacionProducto);

            var resultado = await conexion.QueryAsync<CompraHistorialPrecioDTO>(
                "SP_Compra_HistorialPreciosPorProducto",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<CompraResumenInteligenteDTO?> ObtenerResumenInteligentePreciosAsync(int idProducto, int idPresentacionProducto)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProducto", idProducto);
            parametros.Add("@IdPresentacionProducto", idPresentacionProducto);

            var resultado = await conexion.QueryFirstOrDefaultAsync<CompraResumenInteligenteDTO>(
                "SP_Compra_ResumenInteligentePrecios",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<CompraEvaluacionAutomaticaDTO?> EvaluarCompraAsync(int idCompra)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdCompra", idCompra);

            var resultado = await conexion.QueryFirstOrDefaultAsync<CompraEvaluacionAutomaticaDTO>(
                "SP_Compra_EvaluarCompra",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<IEnumerable<CompraAlertaDTO>> ObtenerAlertasPorProductoAsync(int idProducto, int idPresentacionProducto)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProducto", idProducto);
            parametros.Add("@IdPresentacionProducto", idPresentacionProducto);

            var resultado = await conexion.QueryAsync<CompraAlertaDTO>(
                "SP_Compra_AlertasPorProducto",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }
    }
}