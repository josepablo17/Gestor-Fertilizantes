using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Interfaces;
using Dapper;
using System.Data;

namespace Control_Fertilizantes_Backend.Repositories
{
    public class ComparadorProveedorRepositorio : IComparadorProveedorRepositorio
    {
        private readonly IConexionBD _conexionBD;

        public ComparadorProveedorRepositorio(IConexionBD conexionBD)
        {
            _conexionBD = conexionBD;
        }

        public async Task<IEnumerable<ComparadorProveedorItemDTO>> ObtenerComparativaAsync(
            int idProducto,
            int idPresentacionProducto,
            string? moneda,
            int? mesesAnalisis,
            bool soloAutorizados)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProducto", idProducto);
            parametros.Add("@IdPresentacionProducto", idPresentacionProducto);
            parametros.Add("@Moneda", moneda);
            parametros.Add("@MesesAnalisis", mesesAnalisis);
            parametros.Add("@SoloAutorizados", soloAutorizados);

            var resultado = await conexion.QueryAsync<ComparadorProveedorItemDTO>(
                "SP_ComparadorProveedor_ObtenerComparativa",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<IEnumerable<ComparadorProveedorDetalleDTO>> ObtenerDetalleHistoricoProveedorAsync(
            int idProducto,
            int idPresentacionProducto,
            int idProveedor,
            string? moneda,
            int? mesesAnalisis)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProducto", idProducto);
            parametros.Add("@IdPresentacionProducto", idPresentacionProducto);
            parametros.Add("@IdProveedor", idProveedor);
            parametros.Add("@Moneda", moneda);
            parametros.Add("@MesesAnalisis", mesesAnalisis);

            var resultado = await conexion.QueryAsync<ComparadorProveedorDetalleDTO>(
                "SP_ComparadorProveedor_ObtenerDetalleHistoricoProveedor",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }
    }
}