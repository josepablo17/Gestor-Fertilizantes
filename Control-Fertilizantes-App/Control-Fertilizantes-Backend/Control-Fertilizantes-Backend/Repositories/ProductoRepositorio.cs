using Control_Fertilizantes_Backend.Entities;
using Control_Fertilizantes_Backend.Interfaces;

using Dapper;
using System.Data;

namespace Control_Fertilizantes_Backend.Repositories

{
    public class ProductoRepositorio : IProductoRepositorio
    {
        private readonly IConexionBD _conexionBD;

        public ProductoRepositorio(IConexionBD conexionBD)
        {
            _conexionBD = conexionBD;
        }

        public async Task<IEnumerable<Producto>> ListarAsync()
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var resultado = await conexion.QueryAsync<Producto>(
                "SP_Producto_Listar",
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<Producto?> ObtenerPorIdAsync(int idProducto)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProducto", idProducto);

            var resultado = await conexion.QueryFirstOrDefaultAsync<Producto>(
                "SP_Producto_ObtenerPorId",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<int> InsertarAsync(Producto producto)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@Nombre", producto.Nombre);
            parametros.Add("@Categoria", producto.Categoria);
            parametros.Add("@Marca", producto.Marca);
            parametros.Add("@Descripcion", producto.Descripcion);

            var idProducto = await conexion.QueryFirstAsync<int>(
                "SP_Producto_Insertar",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return idProducto;
        }

        public async Task<bool> ActualizarAsync(Producto producto)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProducto", producto.IdProducto);
            parametros.Add("@Nombre", producto.Nombre);
            parametros.Add("@Categoria", producto.Categoria);
            parametros.Add("@Marca", producto.Marca);
            parametros.Add("@Descripcion", producto.Descripcion);

            var filasAfectadas = await conexion.QueryFirstAsync<int>(
                "SP_Producto_Actualizar",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return filasAfectadas > 0;
        }

        public async Task<bool> DesactivarAsync(int idProducto)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProducto", idProducto);

            var filasAfectadas = await conexion.QueryFirstAsync<int>(
                "SP_Producto_Desactivar",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return filasAfectadas > 0;
        }
    }
}
