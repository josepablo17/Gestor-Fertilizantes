using System.Data;
using Dapper;
using Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.Contratos;
using Control_Fertilizantes_Backend.Modulos.Catalogos.ProductosBase.Modelos;


namespace Control_Fertilizantes_Backend.Infraestructura.Persistencia.Repositorios.Catalogos.ProductosBase;

public class ProductoBaseRepositorio(IConexionBD conexionBD) : IProductoBaseRepositorio
{
    public async Task<IEnumerable<ProductoBase>> ListarAsync(bool soloActivos = false, string? buscar = null)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = new DynamicParameters();
        parametros.Add("@SoloActivos", soloActivos, DbType.Boolean);
        parametros.Add("@Buscar", buscar, DbType.String, size: 150);
        return await conexion.QueryAsync<ProductoBase>("dbo.usp_ProductoBase_Listar", parametros, commandType: CommandType.StoredProcedure);
    }

    public async Task<ProductoBase?> ObtenerPorIdAsync(int id)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = new DynamicParameters();
        parametros.Add("@IdProductoBase", id, DbType.Int32);
        return await conexion.QuerySingleOrDefaultAsync<ProductoBase>("dbo.usp_ProductoBase_ObtenerPorId", parametros, commandType: CommandType.StoredProcedure);
    }

    public async Task<int> InsertarAsync(ProductoBaseGuardar datos)
    {
        using var conexion = conexionBD.ObtenerConexion();
        return await conexion.QuerySingleAsync<int>("dbo.usp_ProductoBase_Insertar", Parametros(datos), commandType: CommandType.StoredProcedure);
    }

    public async Task<bool> ActualizarAsync(ProductoBaseGuardar datos)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = Parametros(datos);
        parametros.Add("@IdProductoBase", datos.IdProductoBase, DbType.Int32);
        return await conexion.QuerySingleAsync<int>("dbo.usp_ProductoBase_Actualizar", parametros, commandType: CommandType.StoredProcedure) > 0;
    }

    public async Task<bool> CambiarActivoAsync(int id, bool activo)
    {
        using var conexion = conexionBD.ObtenerConexion();
        var parametros = new DynamicParameters();
        parametros.Add("@IdProductoBase", id, DbType.Int32);
        parametros.Add("@Activo", activo, DbType.Boolean);
        return await conexion.QuerySingleAsync<int>("dbo.usp_ProductoBase_CambiarActivo", parametros, commandType: CommandType.StoredProcedure) > 0;
    }

    private static DynamicParameters Parametros(ProductoBaseGuardar datos)
    {
        var parametros = new DynamicParameters();
        parametros.Add("@Codigo", datos.Codigo, DbType.String, size: 40);
        parametros.Add("@Nombre", datos.Nombre, DbType.String, size: 150);
        parametros.Add("@FormulaDeclarada", datos.FormulaDeclarada, DbType.String, size: 100);
        parametros.Add("@Descripcion", datos.Descripcion, DbType.String, size: 500);
        parametros.Add("@ComparabilidadRevisada", datos.ComparabilidadRevisada, DbType.Boolean);
        return parametros;
    }


}
