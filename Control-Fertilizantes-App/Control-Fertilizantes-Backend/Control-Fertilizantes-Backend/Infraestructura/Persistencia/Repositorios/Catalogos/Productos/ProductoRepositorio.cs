using System.Data;
using Dapper;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.Productos.Modelos;


namespace Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Catalogos.Productos;

public class ProductoRepositorio(IConexionBD conexionBD) : IProductoRepositorio
{
    public async Task<IEnumerable<Producto>> ListarAsync(bool soloActivos = false, string? buscar = null, int? idProductoBase = null, int? idMarca = null)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = new DynamicParameters();
        parametros.Add("@SoloActivos", soloActivos, DbType.Boolean);
        parametros.Add("@Buscar", buscar, DbType.String, size: 150);
        parametros.Add("@IdProductoBase", idProductoBase, DbType.Int32);
        parametros.Add("@IdMarca", idMarca, DbType.Int32);
        return await conexion.QueryAsync<Producto>("dbo.SP_Producto_Listar", parametros, commandType: CommandType.StoredProcedure);
    }

    public async Task<Producto?> ObtenerPorIdAsync(int id)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = new DynamicParameters();
        parametros.Add("@IdProducto", id, DbType.Int32);
        return await conexion.QuerySingleOrDefaultAsync<Producto>("dbo.SP_Producto_ObtenerPorId", parametros, commandType: CommandType.StoredProcedure);
    }

    public async Task<int> InsertarAsync(ProductoGuardar datos)
    {
        using var conexion = conexionBD.ObtenerConexion();
        return await conexion.QuerySingleAsync<int>("dbo.SP_Producto_Insertar", Parametros(datos), commandType: CommandType.StoredProcedure);
    }

    public async Task<bool> ActualizarAsync(ProductoGuardar datos)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = Parametros(datos);
        parametros.Add("@IdProducto", datos.IdProducto, DbType.Int32);
        return await conexion.QuerySingleAsync<int>("dbo.SP_Producto_Actualizar", parametros, commandType: CommandType.StoredProcedure) > 0;
    }

    public async Task<bool> DesactivarAsync(int id)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = new DynamicParameters();
        parametros.Add("@IdProducto", id, DbType.Int32);

        return await conexion.QuerySingleAsync<int>("dbo.SP_Producto_Desactivar", parametros, commandType: CommandType.StoredProcedure) > 0;
    }

    private static DynamicParameters Parametros(ProductoGuardar datos)
    {
        var parametros = new DynamicParameters();
        parametros.Add("@Nombre", datos.Nombre, DbType.String, size: 150);
        parametros.Add("@IdProductoBase", datos.IdProductoBase, DbType.Int32);
        parametros.Add("@IdMarca", datos.IdMarca, DbType.Int32);
        parametros.Add("@Categoria", datos.Categoria, DbType.String, size: 100);
        parametros.Add("@Descripcion", datos.Descripcion, DbType.String, size: 250);
        parametros.Add("@CodigoInterno", datos.CodigoInterno, DbType.String, size: 40);
        return parametros;
    }


}
