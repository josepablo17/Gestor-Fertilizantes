using Control_Fertilizantes_Backend.Entities;
using Control_Fertilizantes_Backend.Interfaces;

using Dapper;
using System.Data;

namespace Control_Fertilizantes_Backend.Repositories

{
    public class ProveedorRepositorio : IProveedorRepositorio
    {
        private readonly IConexionBD _conexionBD;

        public ProveedorRepositorio (IConexionBD conexionBD)
        {
            _conexionBD = conexionBD;
        }

        public async Task<IEnumerable<Proveedor>> ListarAsync()
        {
            using var conexion = _conexionBD.ObtenerConexion();
            var resultado = await conexion.QueryAsync<Proveedor>(
            "SP_Proveedor_Listar",
            commandType: CommandType.StoredProcedure
            );
            return resultado;
        }

        public async Task<Proveedor?> ObtenerPorIdAsync(int idProveedor)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProveedor",idProveedor);

            var resultado = await conexion.QueryFirstOrDefaultAsync<Proveedor>(
                "SP_Proveedor_ObtenerPorId",
                parametros,
                commandType: CommandType.StoredProcedure
                );

            return resultado;
        }

        public async Task<int> InsertarAsync(Proveedor proveedor)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@Nombre",proveedor.Nombre);
            parametros.Add("@Contacto",proveedor.Contacto);
            parametros.Add("@Telefono",proveedor.Telefono);
            parametros.Add("@Correo",proveedor.Correo);
            parametros.Add("@EsProveedorAutorizado",proveedor.EsProveedorAutorizado);

            var idProducto = await conexion.QueryFirstAsync<int>(
                "SP_Proveedor_Insertar",
                parametros,
                commandType: CommandType.StoredProcedure
                );
            return idProducto;
        }

        public async Task<bool> ActualizarAsync(Proveedor proveedor)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProveedor", proveedor.IdProveedor);
            parametros.Add("@Nombre", proveedor.Nombre);
            parametros.Add("@Contacto", proveedor.Contacto);
            parametros.Add("@Telefono", proveedor.Telefono);
            parametros.Add("@Correo", proveedor.Correo);
            parametros.Add("@EsProveedorAutorizado", proveedor.EsProveedorAutorizado);

            var filasAfectadas = await conexion.QueryFirstAsync<int>(
                "SP_Proveedor_Actualizar",
                parametros,
                commandType: CommandType.StoredProcedure
                );

            return filasAfectadas > 0;
        }

        public async Task<bool> DesactivarAsync(int IdProveedor)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProveedor", IdProveedor);

            var filasAfectadas = await conexion.QueryFirstAsync<int>(
                "SP_Proveedor_Desactivar",
                parametros,
                commandType: CommandType.StoredProcedure
                );
            return filasAfectadas > 0;
        }
    }
}
