using System.Data;
using Dapper;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Presentaciones.Modelos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.DTOs.Salidas;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.DTOs.Salidas;

namespace Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Catalogos.Presentaciones;

public class PresentacionProductoRepositorio(IConexionBD conexionBD) : IPresentacionProductoRepositorio
{
    public async Task<IEnumerable<PresentacionProducto>> ListarAsync(int? idProducto = null, bool soloActivos = false)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = new DynamicParameters();
        parametros.Add("@SoloActivos", soloActivos, DbType.Boolean);
        parametros.Add("@IdProducto", idProducto, DbType.Int32);
        return await conexion.QueryAsync<PresentacionProducto>("dbo.SP_PresentacionesProducto_Listar", parametros, commandType: CommandType.StoredProcedure);
    }

    public async Task<PresentacionProducto?> ObtenerPorIdAsync(int id)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = new DynamicParameters();
        parametros.Add("@IdPresentacionProducto", id, DbType.Int32);
        return await conexion.QuerySingleOrDefaultAsync<PresentacionProducto>("dbo.SP_PresentacionesProducto_ObtenerPorId", parametros, commandType: CommandType.StoredProcedure);
    }

    public async Task<int> InsertarAsync(PresentacionProductoGuardar datos)
    {
        using var conexion = conexionBD.ObtenerConexion();
        return await conexion.QuerySingleAsync<int>("dbo.SP_PresentacionesProducto_Insertar", Parametros(datos), commandType: CommandType.StoredProcedure);
    }

    public async Task<bool> ActualizarAsync(PresentacionProductoGuardar datos)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = Parametros(datos);
        parametros.Add("@IdPresentacionProducto", datos.IdPresentacionProducto, DbType.Int32);
        return await conexion.QuerySingleAsync<int>("dbo.SP_PresentacionesProducto_Actualizar", parametros, commandType: CommandType.StoredProcedure) > 0;
    }

    public async Task<bool> DesactivarAsync(int id)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = new DynamicParameters();
        parametros.Add("@IdPresentacionProducto", id, DbType.Int32);

        return await conexion.QuerySingleAsync<int>("dbo.SP_PresentacionesProducto_Desactivar", parametros, commandType: CommandType.StoredProcedure) > 0;
    }

    private static DynamicParameters Parametros(PresentacionProductoGuardar datos)
    {
        var parametros = new DynamicParameters();
        parametros.Add("@IdProducto", datos.IdProducto, DbType.Int32);
        parametros.Add("@Descripcion", datos.Descripcion, DbType.String, size: 150);
        parametros.Add("@Cantidad", datos.Cantidad, DbType.Decimal, precision: 18, scale: 4);
        parametros.Add("@IdUnidadMedida", datos.IdUnidadMedida, DbType.Int32);
        return parametros;
    }

    public async Task<IEnumerable<ProductoDropdownDTO>> ListarProductosParaDropdownAsync()
    {
        using var conexion = conexionBD.ObtenerConexion();
        return await conexion.QueryAsync<ProductoDropdownDTO>("dbo.SP_Productos_ListarParaDropdown", commandType: CommandType.StoredProcedure);
    }

    public async Task<IEnumerable<UnidadMedidaDropdownDTO>> ListarUnidadesMedidaParaDropdownAsync()
    {
        using var conexion = conexionBD.ObtenerConexion();
        return await conexion.QueryAsync<UnidadMedidaDropdownDTO>("dbo.SP_UnidadesMedida_ListarParaDropdown", commandType: CommandType.StoredProcedure);
    }
}
