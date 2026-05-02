using Control_Fertilizantes_Backend.DTOs;
using Control_Fertilizantes_Backend.Interfaces;
using Dapper;
using System.Data;

namespace Control_Fertilizantes_Backend.Repositories
{
    public class ProformaProveedorRepositorio : IProformaProveedorRepositorio
    {
        private readonly IConexionBD _conexionBD;

        public ProformaProveedorRepositorio(IConexionBD conexionBD)
        {
            _conexionBD = conexionBD;
        }

        public async Task<int> InsertarAsync(GuardarProformaProveedorDTO proforma)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@NumeroProforma", proforma.NumeroProforma);
            parametros.Add("@IdProveedor", proforma.IdProveedor);
            parametros.Add("@FechaProforma", proforma.FechaProforma);
            parametros.Add("@FechaVencimiento", proforma.FechaVencimiento);
            parametros.Add("@DiasCredito", proforma.DiasCredito);
            parametros.Add("@TipoDocumento", proforma.TipoDocumento);

            parametros.Add("@NombreProveedorPdf", proforma.NombreProveedorPdf);
            parametros.Add("@NombreNegocio", proforma.NombreNegocio);
            parametros.Add("@RazonSocial", proforma.RazonSocial);
            parametros.Add("@Cedula", proforma.Cedula);
            parametros.Add("@Telefono", proforma.Telefono);
            parametros.Add("@Vendedor", proforma.Vendedor);

            parametros.Add("@Subtotal", proforma.Subtotal);
            parametros.Add("@Descuento", proforma.Descuento);
            parametros.Add("@IVA", proforma.IVA);
            parametros.Add("@Total", proforma.Total);

            parametros.Add("@Observaciones", proforma.Observaciones);

            var idProformaProveedor = await conexion.QueryFirstAsync<int>(
                "SP_ProformaProveedor_Insertar",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return idProformaProveedor;
        }

        public async Task<int> InsertarDetalleAsync(GuardarProformaProveedorDetalleDTO detalle)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProformaProveedor", detalle.IdProformaProveedor);
            parametros.Add("@CodigoProveedor", detalle.CodigoProveedor);
            parametros.Add("@DescripcionProveedor", detalle.DescripcionProveedor);

            parametros.Add("@IdProducto", detalle.IdProducto);
            parametros.Add("@IdPresentacionProducto", detalle.IdPresentacionProducto);

            parametros.Add("@Cantidad", detalle.Cantidad);
            parametros.Add("@PrecioUnitario", detalle.PrecioUnitario);
            parametros.Add("@DescuentoPorcentaje", detalle.DescuentoPorcentaje);
            parametros.Add("@TotalLinea", detalle.TotalLinea);

            parametros.Add("@ProductoEncontrado", detalle.ProductoEncontrado);
            parametros.Add("@PresentacionEncontrada", detalle.PresentacionEncontrada);
            parametros.Add("@SePuedeRegistrar", detalle.SePuedeRegistrar);

            parametros.Add("@ObservacionValidacion", detalle.ObservacionValidacion);

            var idProformaProveedorDetalle = await conexion.QueryFirstAsync<int>(
                "SP_ProformaProveedorDetalle_Insertar",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return idProformaProveedorDetalle;
        }

        public async Task<IEnumerable<ProformaProveedorRespuestaDTO>> ListarAsync()
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var resultado = await conexion.QueryAsync<ProformaProveedorRespuestaDTO>(
                "SP_ProformaProveedor_Listar",
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<ProformaProveedorRespuestaDTO?> ObtenerPorIdAsync(int idProformaProveedor)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProformaProveedor", idProformaProveedor);

            var resultado = await conexion.QueryFirstOrDefaultAsync<ProformaProveedorRespuestaDTO>(
                "SP_ProformaProveedor_ObtenerPorId",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<IEnumerable<ProformaProveedorDetalleRespuestaDTO>> ListarDetallesAsync(int idProformaProveedor)
        {
            using var conexion = _conexionBD.ObtenerConexion();

            var parametros = new DynamicParameters();
            parametros.Add("@IdProformaProveedor", idProformaProveedor);

            var resultado = await conexion.QueryAsync<ProformaProveedorDetalleRespuestaDTO>(
                "SP_ProformaProveedorDetalle_ListarPorProforma",
                parametros,
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }
    }
}