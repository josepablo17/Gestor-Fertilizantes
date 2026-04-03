using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Entities;
using Control_Fertilizantes_Backend.Interfaces;
using Dapper;
using System.Data;

namespace Control_Fertilizantes_Backend.Repositories
{
    public class PresentacionProductoRepositorio : IPresentacionProductoRepositorio
    {
        private readonly IConexionBD _conexionBD;

        public PresentacionProductoRepositorio(IConexionBD conexionBD)
        {
            _conexionBD = conexionBD;
        }

        public async Task<IEnumerable<PresentacionProducto>> ListarAsync()
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var resultado = await conexion.QueryAsync<PresentacionProducto>(
                "SP_PresentacionesProducto_Listar",
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<PresentacionProducto?> ObtenerPorIdAsync(int idPresentacionProducto)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdPresentacionProducto", idPresentacionProducto);

            var resultado = await conexion.QueryFirstOrDefaultAsync<PresentacionProducto>(
                "SP_PresentacionesProducto_ObtenerPorId",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<int> InsertarAsync(PresentacionProducto presentacionProducto)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProducto", presentacionProducto.IdProducto);
            parametros.Add("@Descripcion", presentacionProducto.Descripcion);
            parametros.Add("@Cantidad", presentacionProducto.Cantidad);
            parametros.Add("@IdUnidadMedida", presentacionProducto.IdUnidadMedida);
            parametros.Add("@CantidadNormalizada", presentacionProducto.CantidadNormalizada);

            var idPresentacionProducto = await conexion.QueryFirstAsync<int>(
                "SP_PresentacionesProducto_Insertar",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return idPresentacionProducto;
        }

        public async Task<bool> ActualizarAsync(PresentacionProducto presentacionProducto)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdPresentacionProducto", presentacionProducto.IdPresentacionProducto);
            parametros.Add("@IdProducto", presentacionProducto.IdProducto);
            parametros.Add("@Descripcion", presentacionProducto.Descripcion);
            parametros.Add("@Cantidad", presentacionProducto.Cantidad);
            parametros.Add("@IdUnidadMedida", presentacionProducto.IdUnidadMedida);
            parametros.Add("@CantidadNormalizada", presentacionProducto.CantidadNormalizada);

            var filasAfectadas = await conexion.QueryFirstAsync<int>(
                "SP_PresentacionesProducto_Actualizar",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return filasAfectadas > 0;
        }

        public async Task<bool> DesactivarAsync(int idPresentacionProducto)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdPresentacionProducto", idPresentacionProducto);

            var filasAfectadas = await conexion.QueryFirstAsync<int>(
                "SP_PresentacionesProducto_Desactivar",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return filasAfectadas > 0;
        }

        public async Task<IEnumerable<ProductoDropdownDTO>> ListarProductosParaDropdownAsync()
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var resultado = await conexion.QueryAsync<ProductoDropdownDTO>(
                "SP_Productos_ListarParaDropdown",
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<IEnumerable<UnidadMedidaDropdownDTO>> ListarUnidadesMedidaParaDropdownAsync()
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var resultado = await conexion.QueryAsync<UnidadMedidaDropdownDTO>(
                "SP_UnidadesMedida_ListarParaDropdown",
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }
    }
}