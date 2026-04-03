using Control_Fertilizantes_Backend.Entities;
using Control_Fertilizantes_Backend.Interfaces;
using Dapper;
using System.Data;

namespace Control_Fertilizantes_Backend.Repositories
{
    public class CompraRepositorio : ICompraRepositorio
    {
        private readonly IConexionBD _conexionBD;

        public CompraRepositorio(IConexionBD conexionBD)
        {
            _conexionBD = conexionBD;
        }


        public async Task<IEnumerable<Compra>> ListarAsync()
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var resultado = await conexion.QueryAsync<Compra>(
                "SP_Compra_Listar",
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<Compra?> ObtenerPorIdAsync(int idCompra)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdCompra", idCompra);

            var resultado = await conexion.QueryFirstOrDefaultAsync<Compra>(
                "SP_Compra_ObtenerPorId",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<int> InsertarAsync(Compra compra)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProducto", compra.IdProducto);
            parametros.Add("@IdProveedor", compra.IdProveedor);
            parametros.Add("@IdPresentacionProducto", compra.IdPresentacionProducto);
            parametros.Add("@FechaCompra", compra.FechaCompra);
            parametros.Add("@CantidadComprada", compra.CantidadComprada);
            parametros.Add("@PrecioTotal", compra.PrecioTotal);
            parametros.Add("@Moneda", compra.Moneda);
            parametros.Add("@Observaciones", compra.Observaciones);

            var idInsertado = await conexion.ExecuteScalarAsync<int>(
                "SP_Compra_Insertar",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return idInsertado;
        }

        public async Task<bool> ActualizarAsync(Compra compra)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdCompra", compra.IdCompra);
            parametros.Add("@IdProducto", compra.IdProducto);
            parametros.Add("@IdProveedor", compra.IdProveedor);
            parametros.Add("@IdPresentacionProducto", compra.IdPresentacionProducto);
            parametros.Add("@FechaCompra", compra.FechaCompra);
            parametros.Add("@CantidadComprada", compra.CantidadComprada);
            parametros.Add("@PrecioTotal", compra.PrecioTotal);
            parametros.Add("@Moneda", compra.Moneda);
            parametros.Add("@Observaciones", compra.Observaciones);

            var filasAfectadas = await conexion.QueryFirstAsync<int>(
                "SP_Compra_Actualizar",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return filasAfectadas > 0;
        }

        public async Task<IEnumerable<Compra>> HistorialPorProductoAsync(int idProducto)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProducto", idProducto);

            var resultado = await conexion.QueryAsync<Compra>(
                "SP_Compra_HistorialPorProducto",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<Compra?> ObtenerUltimoPrecioAsync(int idProducto, int idPresentacionProducto)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProducto", idProducto);
            parametros.Add("@IdPresentacionProducto", idPresentacionProducto);

            var resultado = await conexion.QueryFirstOrDefaultAsync<Compra>(
                "SP_Compra_UltimoPrecio",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }
    }
}