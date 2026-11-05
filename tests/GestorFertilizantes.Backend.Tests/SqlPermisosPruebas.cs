using System.Data;
using System.Text.Json;
using System.Text.RegularExpressions;
using Control_Fertilizantes_Backend.Middlewares;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace GestorFertilizantes.Backend.Tests;

[Trait("Categoria", "Sql")]
public class SqlPermisosPruebas
{
    private static async Task<SqlConnection> AbrirAsync()
    {
        var cadena = Environment.GetEnvironmentVariable("GF_API_TEST_CONNECTION_STRING");
        if (string.IsNullOrWhiteSpace(cadena))
            throw new InvalidOperationException("La integracion SQL requiere GF_API_TEST_CONNECTION_STRING.");
        if (!Regex.IsMatch(new SqlConnectionStringBuilder(cadena).InitialCatalog, "^GF_DB_COMPOSE_[a-f0-9]{32}$"))
            throw new InvalidOperationException("La integracion SQL solo admite la base temporal propia de Compose.");
        var conexion = new SqlConnection(cadena);
        await conexion.OpenAsync();
        return conexion;
    }

    [Fact]
    public async Task Usuario_ejecuta_procedimientos_sin_ser_administrador()
    {
        await using var conexion = await AbrirAsync();
        await using var consulta = new SqlCommand(
            "SELECT IS_SRVROLEMEMBER('sysadmin'), IS_MEMBER('db_owner'), IS_MEMBER('rol_gestor_api'), HAS_PERMS_BY_NAME(DB_NAME(),'DATABASE','CONTROL');", conexion);
        await using var lector = await consulta.ExecuteReaderAsync();
        Assert.True(await lector.ReadAsync());
        Assert.Equal(0, lector.GetInt32(0));
        Assert.Equal(0, lector.GetInt32(1));
        Assert.Equal(1, lector.GetInt32(2));
        Assert.Equal(0, lector.GetInt32(3));
        await lector.DisposeAsync();
        await using var procedimiento = new SqlCommand("dbo.SP_UnidadMedida_Listar", conexion)
            { CommandType = CommandType.StoredProcedure };
        await using var unidades = await procedimiento.ExecuteReaderAsync();
        Assert.True(await unidades.ReadAsync());
    }

    [Theory]
    [InlineData("EXEC dbo.usp_Proforma_ComprobarJson N'{}',N'[]';")]
    [InlineData("SELECT TOP(0) * FROM dbo.Productos;")]
    [InlineData("UPDATE dbo.Productos SET Nombre=Nombre WHERE 1=0;")]
    [InlineData("DELETE FROM dbo.Productos WHERE 1=0;")]
    [InlineData("CREATE TABLE dbo.NoDebeCrearse(Id int);")]
    public async Task Acceso_directo_y_ddl_estan_denegados(string sql)
    {
        await using var conexion = await AbrirAsync();
        // Incluso una configuracion incorrecta no debe dejar un objeto de prueba.
        await using var transaccion = (SqlTransaction)await conexion.BeginTransactionAsync();
        try
        {
            await using var comando = new SqlCommand(sql, conexion, transaccion);
            var error = await Assert.ThrowsAsync<SqlException>(() => comando.ExecuteNonQueryAsync());
            Assert.Contains(error.Number, new[] { 229, 262 });
        }
        finally
        {
            await transaccion.RollbackAsync();
        }
    }

    [Fact]
    public async Task Usuario_puede_guardar_catalogos_por_procedimientos_y_revertir_la_prueba()
    {
        await using var conexion = await AbrirAsync();
        await using var transaccion = (SqlTransaction)await conexion.BeginTransactionAsync();
        try
        {
            var sufijo = Guid.NewGuid().ToString("N");
            await using var marca = new SqlCommand("dbo.usp_Marca_Insertar", conexion, transaccion)
                { CommandType = CommandType.StoredProcedure };
            marca.Parameters.Add("@Nombre", SqlDbType.NVarChar, 150).Value = "Marca prueba " + sufijo;
            var idMarca = Convert.ToInt32(await marca.ExecuteScalarAsync());
            await using var baseProducto = new SqlCommand("dbo.usp_ProductoBase_Insertar", conexion, transaccion)
                { CommandType = CommandType.StoredProcedure };
            baseProducto.Parameters.Add("@Codigo", SqlDbType.NVarChar, 40).Value = "T-" + sufijo;
            baseProducto.Parameters.Add("@Nombre", SqlDbType.NVarChar, 150).Value = "Base prueba " + sufijo;
            var idBase = Convert.ToInt32(await baseProducto.ExecuteScalarAsync());
            await using var producto = new SqlCommand("dbo.SP_Producto_Insertar", conexion, transaccion)
                { CommandType = CommandType.StoredProcedure };
            producto.Parameters.Add("@Nombre", SqlDbType.NVarChar, 150).Value = "Producto prueba " + sufijo;
            producto.Parameters.Add("@IdProductoBase", SqlDbType.Int).Value = idBase;
            producto.Parameters.Add("@IdMarca", SqlDbType.Int).Value = idMarca;
            Assert.True(Convert.ToInt32(await producto.ExecuteScalarAsync()) > 0);
        }
        finally { await transaccion.RollbackAsync(); }
    }

    [Theory]
    [InlineData(52000, 400)]
    [InlineData(52004, 404)]
    [InlineData(52009, 409)]
    [InlineData(52010, 409)]
    [InlineData(51107, 409)]
    [InlineData(51201, 400)]
    [InlineData(51204, 404)]
    [InlineData(51205, 409)]
    public async Task Middleware_traduce_excepciones_sql_reales_sin_exponer_el_mensaje(int numero, int estado)
    {
        await using var conexion = await AbrirAsync();
        using var servicios = new ServiceCollection().AddLogging().BuildServiceProvider();
        var contexto = new DefaultHttpContext { RequestServices = servicios };
        await using var cuerpo = new MemoryStream();
        contexto.Response.Body = cuerpo;
        var middleware = new ManejoGlobalExcepcionesMiddleware(async _ =>
        {
            await using var comando = new SqlCommand($"THROW {numero}, N'DATO_INTERNO_NO_PUBLICAR', 1;", conexion);
            await comando.ExecuteNonQueryAsync();
        }, NullLogger<ManejoGlobalExcepcionesMiddleware>.Instance);
        await middleware.InvokeAsync(contexto);
        Assert.Equal(estado, contexto.Response.StatusCode);
        cuerpo.Position = 0;
        using var json = await JsonDocument.ParseAsync(cuerpo);
        Assert.False(json.RootElement.GetProperty("exito").GetBoolean());
        Assert.DoesNotContain("DATO_INTERNO_NO_PUBLICAR", json.RootElement.ToString());
    }
}
