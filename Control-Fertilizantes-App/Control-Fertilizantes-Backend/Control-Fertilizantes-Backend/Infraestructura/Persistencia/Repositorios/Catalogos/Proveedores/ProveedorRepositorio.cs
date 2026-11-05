using System.Data;
using Dapper;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Proveedores.Modelos;


namespace Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Catalogos.Proveedores;

public class ProveedorRepositorio(IConexionBD conexionBD) : IProveedorRepositorio
{
    public async Task<IEnumerable<Proveedor>> ListarAsync(bool soloActivos = false, string? buscar = null)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = new DynamicParameters();
        parametros.Add("@SoloActivos", soloActivos, DbType.Boolean);
        parametros.Add("@Buscar", buscar, DbType.String, size: 150);
        return await conexion.QueryAsync<Proveedor>("dbo.SP_Proveedor_Listar", parametros, commandType: CommandType.StoredProcedure);
    }

    public async Task<Proveedor?> ObtenerPorIdAsync(int id)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = new DynamicParameters();
        parametros.Add("@IdProveedor", id, DbType.Int32);
        return await conexion.QuerySingleOrDefaultAsync<Proveedor>("dbo.SP_Proveedor_ObtenerPorId", parametros, commandType: CommandType.StoredProcedure);
    }

    public async Task<int> InsertarAsync(ProveedorGuardar datos)
    {
        using var conexion = conexionBD.ObtenerConexion();
        return await conexion.QuerySingleAsync<int>("dbo.SP_Proveedor_Insertar", Parametros(datos), commandType: CommandType.StoredProcedure);
    }

    public async Task<bool> ActualizarAsync(ProveedorGuardar datos)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = Parametros(datos);
        parametros.Add("@IdProveedor", datos.IdProveedor, DbType.Int32);
        return await conexion.QuerySingleAsync<int>("dbo.SP_Proveedor_Actualizar", parametros, commandType: CommandType.StoredProcedure) > 0;
    }

    public async Task<bool> DesactivarAsync(int id)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = new DynamicParameters();
        parametros.Add("@IdProveedor", id, DbType.Int32);

        return await conexion.QuerySingleAsync<int>("dbo.SP_Proveedor_Desactivar", parametros, commandType: CommandType.StoredProcedure) > 0;
    }

    private static DynamicParameters Parametros(ProveedorGuardar datos)
    {
        var parametros = new DynamicParameters();
        parametros.Add("@Nombre", datos.Nombre, DbType.String, size: 150);
        parametros.Add("@Contacto", datos.Contacto, DbType.String, size: 150);
        parametros.Add("@Telefono", datos.Telefono, DbType.String, size: 50);
        parametros.Add("@Correo", datos.Correo, DbType.String, size: 150);
        parametros.Add("@Direccion", datos.Direccion, DbType.String, size: 250);
        parametros.Add("@Provincia", datos.Provincia, DbType.String, size: 100);
        parametros.Add("@Canton", datos.Canton, DbType.String, size: 100);
        parametros.Add("@Distrito", datos.Distrito, DbType.String, size: 100);
        parametros.Add("@FuenteExterna", datos.FuenteExterna, DbType.String, size: 100);
        parametros.Add("@IdExterno", datos.IdExterno, DbType.String, size: 100);
        parametros.Add("@TipoIdentificacion", datos.TipoIdentificacion, DbType.String, size: 30);
        parametros.Add("@IdentificacionFiscal", datos.IdentificacionFiscal, DbType.String, size: 50);
        parametros.Add("@PaisIdentificacion", datos.PaisIdentificacion, DbType.AnsiStringFixedLength, size: 2);
        parametros.Add("@EsProveedorAutorizado", datos.EsProveedorAutorizado, DbType.Boolean);
        parametros.Add("@FechaUltimaSincronizacion", datos.FechaUltimaSincronizacion, DbType.DateTime2);
        return parametros;
    }


}
