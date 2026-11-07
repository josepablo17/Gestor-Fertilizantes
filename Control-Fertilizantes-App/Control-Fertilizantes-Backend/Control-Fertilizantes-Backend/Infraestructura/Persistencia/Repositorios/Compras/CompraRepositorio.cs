using Control_Fertilizantes_Backend.Modulos.Compras.Contratos;
using Control_Fertilizantes_Backend.Modulos.Compras.Modelos;
using Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Presupuestos;
using Control_Fertilizantes_Backend.Modulos.Presupuestos.DTOs.Entradas;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Text.Json;

namespace Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Compras
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

        public async Task<int> InsertarAsync(Compra compra, ImputacionCompraDTO? imputacion = null)
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

            if (imputacion is not null)
            {
                parametros.Add("@DistribucionPresupuestoJson", JsonSerializer.Serialize(imputacion.Distribucion, JsonSerializerOptions.Web));
                parametros.Add("@IdOperacionPresupuesto", imputacion.IdOperacion);
                parametros.Add("@MotivoPresupuesto", imputacion.Motivo);
                parametros.Add("@MotivoExcesoPresupuesto", imputacion.MotivoExceso);
            }

            try
            {
                return await conexion.ExecuteScalarAsync<int>("SP_Compra_Insertar", parametros,
                    commandType: CommandType.StoredProcedure);
            }
            catch (SqlException error) when (imputacion is not null && ErroresPresupuestoSql.EsErrorConocido(error))
            {
                throw ErroresPresupuestoSql.Traducir(error);
            }
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

            try
            {
                var filasAfectadas = await conexion.QueryFirstAsync<int>("SP_Compra_Actualizar", parametros,
                    commandType: CommandType.StoredProcedure);
                return filasAfectadas > 0;
            }
            catch (SqlException error) when (error.Number == 52010)
            {
                throw ErroresPresupuestoSql.Traducir(error);
            }
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

        public async Task<Compra?> ObtenerUltimoPrecioAsync(int idProducto, int idPresentacionProducto,
            string moneda, DateOnly? fechaLimite, int? idCompraLimite, CancellationToken cancelacion)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProducto", idProducto);
            parametros.Add("@IdPresentacionProducto", idPresentacionProducto);
            parametros.Add("@Moneda", moneda);
            parametros.Add("@FechaLimite", fechaLimite?.ToDateTime(TimeOnly.MinValue), DbType.Date);
            parametros.Add("@IdCompraLimite", idCompraLimite);

            return await conexion.QueryFirstOrDefaultAsync<Compra>(new CommandDefinition(
                "SP_Compra_UltimoPrecio", parametros, commandType: CommandType.StoredProcedure, cancellationToken: cancelacion));
        }
    }
}
