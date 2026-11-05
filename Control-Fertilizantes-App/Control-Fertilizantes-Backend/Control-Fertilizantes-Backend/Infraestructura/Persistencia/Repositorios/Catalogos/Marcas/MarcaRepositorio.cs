using System.Data;
using Dapper;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Marcas.Modelos;


namespace Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Catalogos.Marcas;

public class MarcaRepositorio(IConexionBD conexionBD) : IMarcaRepositorio
{
    public async Task<IEnumerable<Marca>> ListarAsync(bool soloActivos = false, string? buscar = null)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = new DynamicParameters();
        parametros.Add("@SoloActivos", soloActivos, DbType.Boolean);
        parametros.Add("@Buscar", buscar, DbType.String, size: 150);
        return await conexion.QueryAsync<Marca>("dbo.usp_Marca_Listar", parametros, commandType: CommandType.StoredProcedure);
    }

    public async Task<Marca?> ObtenerPorIdAsync(int id)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = new DynamicParameters();
        parametros.Add("@IdMarca", id, DbType.Int32);
        return await conexion.QuerySingleOrDefaultAsync<Marca>("dbo.usp_Marca_ObtenerPorId", parametros, commandType: CommandType.StoredProcedure);
    }

    public async Task<int> InsertarAsync(MarcaGuardar datos)
    {
        using var conexion = conexionBD.ObtenerConexion();
        return await conexion.QuerySingleAsync<int>("dbo.usp_Marca_Insertar", Parametros(datos), commandType: CommandType.StoredProcedure);
    }

    public async Task<bool> ActualizarAsync(MarcaGuardar datos)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = Parametros(datos);
        parametros.Add("@IdMarca", datos.IdMarca, DbType.Int32);
        return await conexion.QuerySingleAsync<int>("dbo.usp_Marca_Actualizar", parametros, commandType: CommandType.StoredProcedure) > 0;
    }

    public async Task<bool> CambiarActivoAsync(int id, bool activo)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = new DynamicParameters();
        parametros.Add("@IdMarca", id, DbType.Int32);
        parametros.Add("@Activo", activo, DbType.Boolean);
        return await conexion.QuerySingleAsync<int>("dbo.usp_Marca_CambiarActivo", parametros, commandType: CommandType.StoredProcedure) > 0;
    }

    private static DynamicParameters Parametros(MarcaGuardar datos)
    {
        var parametros = new DynamicParameters();
        parametros.Add("@Nombre", datos.Nombre, DbType.String, size: 150);
        return parametros;
    }


}
