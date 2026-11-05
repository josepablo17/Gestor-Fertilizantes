using System.Data;
using Dapper;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.UnidadesMedida.Modelos;


namespace Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Catalogos.UnidadesMedida;

public class UnidadMedidaRepositorio(IConexionBD conexionBD) : IUnidadMedidaRepositorio
{
    public async Task<IEnumerable<UnidadMedida>> ListarAsync(bool soloActivos = false)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = new DynamicParameters();
        parametros.Add("@SoloActivos", soloActivos, DbType.Boolean);
        return await conexion.QueryAsync<UnidadMedida>("dbo.SP_UnidadMedida_Listar", parametros, commandType: CommandType.StoredProcedure);
    }

    public async Task<UnidadMedida?> ObtenerPorIdAsync(int id)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = new DynamicParameters();
        parametros.Add("@IdUnidadMedida", id, DbType.Int32);
        return await conexion.QuerySingleOrDefaultAsync<UnidadMedida>("dbo.SP_UnidadMedida_ObtenerPorId", parametros, commandType: CommandType.StoredProcedure);
    }

    public async Task<int> InsertarAsync(UnidadMedidaGuardar datos)
    {
        using var conexion = conexionBD.ObtenerConexion();
        return await conexion.QuerySingleAsync<int>("dbo.SP_UnidadMedida_Insertar", Parametros(datos), commandType: CommandType.StoredProcedure);
    }

    public async Task<bool> ActualizarAsync(UnidadMedidaGuardar datos)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = Parametros(datos);
        parametros.Add("@IdUnidadMedida", datos.IdUnidadMedida, DbType.Int32);
        return await conexion.QuerySingleAsync<int>("dbo.SP_UnidadMedida_Actualizar", parametros, commandType: CommandType.StoredProcedure) > 0;
    }

    public async Task<bool> DesactivarAsync(int id)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = new DynamicParameters();
        parametros.Add("@IdUnidadMedida", id, DbType.Int32);

        return await conexion.QuerySingleAsync<int>("dbo.SP_UnidadMedida_Desactivar", parametros, commandType: CommandType.StoredProcedure) > 0;
    }

    private static DynamicParameters Parametros(UnidadMedidaGuardar datos)
    {
        var parametros = new DynamicParameters();
        parametros.Add("@Codigo", datos.Codigo, DbType.String, size: 20);
        parametros.Add("@Nombre", datos.Nombre, DbType.String, size: 50);
        parametros.Add("@TipoBase", datos.TipoBase, DbType.String, size: 20);
        parametros.Add("@FactorConversion", datos.FactorConversion, DbType.Decimal, precision: 18, scale: 6);
        parametros.Add("@EsUnidadBase", datos.EsUnidadBase, DbType.Boolean);
        return parametros;
    }


}
