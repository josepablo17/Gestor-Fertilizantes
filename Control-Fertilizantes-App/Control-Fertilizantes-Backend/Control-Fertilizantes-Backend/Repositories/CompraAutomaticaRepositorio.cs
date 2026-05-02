using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Interfaces;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Control_Fertilizantes_Backend.Repositories
{
    public class CompraAutomaticaRepositorio : ICompraAutomaticaRepositorio
        {
            private readonly IConexionBD _conexionBD;

            public CompraAutomaticaRepositorio(IConexionBD conexionBD)
            {   
                _conexionBD = conexionBD;
            }

            public async Task<ProductoBusquedaDTO?> BuscarProductoParaCompraAutomaticaAsync(string descripcion)
            {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
                parametros.Add("@Descripcion", descripcion);

                return await conexion.QueryFirstOrDefaultAsync<ProductoBusquedaDTO>(
                    "SP_CompraAutomatica_BuscarProducto",
                    parametros,
                    commandType: CommandType.StoredProcedure
                );
            }

            public async Task<PresentacionBusquedaDTO?> BuscarPresentacionParaCompraAutomaticaAsync(int idProducto, string descripcionLinea)
            {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
                parametros.Add("@IdProducto", idProducto);
                parametros.Add("@DescripcionLinea", descripcionLinea);

                return await conexion.QueryFirstOrDefaultAsync<PresentacionBusquedaDTO>(
                    "SP_CompraAutomatica_BuscarPresentacion",
                    parametros,
                    commandType: CommandType.StoredProcedure
                );
            }

            public async Task<ProveedorBusquedaDTO?> BuscarProveedorParaCompraAutomaticaAsync(string nombreNegocio, string razonSocial)
            {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
                parametros.Add("@NombreNegocio", nombreNegocio);
                parametros.Add("@RazonSocial", razonSocial);

                return await conexion.QueryFirstOrDefaultAsync<ProveedorBusquedaDTO>(
                    "SP_CompraAutomatica_BuscarProveedor",
                    parametros,
                    commandType: CommandType.StoredProcedure
                );
            }

            public async Task<int> InsertarCompraDesdeProformaAsync(
                int idProducto,
                int idProveedor,
                int idPresentacionProducto,
                DateTime fechaCompra,
                decimal cantidadComprada,
                decimal precioTotal,
                string moneda,
                string observaciones)
            {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
                parametros.Add("@IdProducto", idProducto);
                parametros.Add("@IdProveedor", idProveedor);
                parametros.Add("@IdPresentacionProducto", idPresentacionProducto);
                parametros.Add("@FechaCompra", fechaCompra);
                parametros.Add("@CantidadComprada", cantidadComprada);
                parametros.Add("@PrecioTotal", precioTotal);
                parametros.Add("@Moneda", moneda);
                parametros.Add("@Observaciones", observaciones);

                var idCompraGenerada = await conexion.QueryFirstOrDefaultAsync<int>(
                    "SP_CompraAutomatica_InsertarCompraDesdeProforma",
                    parametros,
                    commandType: CommandType.StoredProcedure
                );

                return idCompraGenerada;
            }

        public async Task<CompraAutomaticaEquivalenciaDTO?> BuscarEquivalenciaCompraAutomaticaAsync(string? codigoProveedor, string descripcionProveedor)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@CodigoProveedor", codigoProveedor);
            parametros.Add("@DescripcionProveedor", descripcionProveedor);

            return await conexion.QueryFirstOrDefaultAsync<CompraAutomaticaEquivalenciaDTO>(
                "SP_CompraAutomatica_BuscarEquivalencia",
                parametros,
                commandType: CommandType.StoredProcedure
            );
        }
    }
    }
