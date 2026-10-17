using System.Data;
using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using Microsoft.Data.SqlClient;

// Database lifecycle tests intentionally use a NEW random database, never the
// database named in the supplied connection string. Credentials stay in env.
var root = Directory.GetCurrentDirectory();
var artifacts = Path.Combine(root, "artifacts", "verification");
Directory.CreateDirectory(artifacts);
var baseConnection = Environment.GetEnvironmentVariable("GF_SQL_CONNECTION_STRING");
if (string.IsNullOrWhiteSpace(baseConnection))
    throw new InvalidOperationException("Falta GF_SQL_CONNECTION_STRING.");
if (args.Length == 1 && args[0] is "--seed-persistence" or "--verify-persistence")
{
    // This mode is only for the independently generated Compose test database.
    // A normal local database can never be populated by the persistence test.
    var settings = new SqlConnectionStringBuilder(baseConnection);
    Assert(Regex.IsMatch(settings.InitialCatalog, "^GF_DB_COMPOSE_[a-f0-9]{32}$", RegexOptions.CultureInvariant), "La prueba de persistencia exige una base Compose desechable.");
    await using var persistenceConnection = new SqlConnection(settings.ConnectionString);
    await persistenceConnection.OpenAsync();
    await VerifySchema(persistenceConnection);
    var baselinePath = Path.Combine(artifacts, "persistence-baseline.json");
    if (args[0] == "--seed-persistence")
    {
        await VerifyEmptyBusinessData(persistenceConnection);
        await CreateHistory(persistenceConnection, await LoadFixture(root));
        var baseline = new PersistenceBaseline(settings.InitialCatalog, await SequenceValue(persistenceConnection), await Snapshot(persistenceConnection));
        await File.WriteAllTextAsync(baselinePath, JsonSerializer.Serialize(baseline, new JsonSerializerOptions { WriteIndented = true }));
        Console.WriteLine("Historia de prueba guardada para verificar persistencia del volumen.");
    }
    else
    {
        var baseline = JsonSerializer.Deserialize<PersistenceBaseline>(await File.ReadAllTextAsync(baselinePath))
                       ?? throw new InvalidOperationException("Falta baseline de persistencia.");
        Assert(baseline.Database == settings.InitialCatalog, "La baseline pertenece a otra base de prueba.");
        Assert(JsonSerializer.Serialize(baseline.Tables) == JsonSerializer.Serialize(await Snapshot(persistenceConnection)), "La recreacion/redespliegue modifico datos persistidos.");
        Assert(baseline.Sequence == await SequenceValue(persistenceConnection), "Se reinicio la secuencia persistida.");
        await File.WriteAllTextAsync(Path.Combine(artifacts, "persistence-verified.json"), JsonSerializer.Serialize(new { Database = settings.InitialCatalog, AllRowsPreserved = true, SequencePreserved = true }));
        Console.WriteLine("OK: todas las filas y la secuencia sobrevivieron a recrear SQL Server y reaplicar el DACPAC.");
    }
    return;
}
Assert(args.Length == 0, "Modo de prueba no reconocido.");
var masterSettings = new SqlConnectionStringBuilder(baseConnection) { InitialCatalog = "master" };
var database = "GF_DB_TEST_" + Guid.NewGuid().ToString("N");
var targetSettings = new SqlConnectionStringBuilder(baseConnection) { InitialCatalog = database };
var dacpac = Path.Combine(root, "GestorFertilizantes.Database", "bin", "Release", "GestorFertilizantes.Database.dacpac");
var profile = Path.Combine(root, "Profiles", "Portable.publish.xml");
if (!File.Exists(dacpac)) throw new FileNotFoundException("Compilar el DACPAC antes de probar.", dacpac);
var jsonOptions = new JsonSerializerOptions { WriteIndented = true };
var results = new List<TestResult>();
bool created = false, cleaned = false;
try
{
    await using (var master = new SqlConnection(masterSettings.ConnectionString))
    {
        await WaitForServer(master);
        await using var check = new SqlCommand("SELECT COUNT(*) FROM sys.databases WHERE name=@name", master);
        check.Parameters.Add("@name", SqlDbType.NVarChar, 128).Value = database;
        Assert(Convert.ToInt32(await check.ExecuteScalarAsync()) == 0, "La base aleatoria ya existe.");
    }
    // Set before publish: a failed deployment may still leave a partial database.
    created = true;
    Console.WriteLine("Creacion desde cero: " + database);
    await SqlPackage("Publish", null);
    await using var connection = new SqlConnection(targetSettings.ConnectionString);
    await connection.OpenAsync();
    await VerifySchema(connection);
    await VerifyEmptyBusinessData(connection);

    var fixture = await LoadFixture(root);
    var cases = JsonSerializer.Deserialize<TestCase[]>(await File.ReadAllTextAsync(Path.Combine(root, "tests", "casos-integracion.json")))
                ?? throw new InvalidOperationException("No hay casos de prueba.");
    foreach (var test in cases)
    {
        bool reachedAction = false, ok = false;
        string? detail = null;
        SqlInfoMessageEventHandler onInfo = (_, e) => reachedAction |= e.Message.Contains("TEST_ACTION_START", StringComparison.Ordinal);
        connection.InfoMessage += onInfo;
        await using var transaction = (SqlTransaction)await connection.BeginTransactionAsync();
        try
        {
            var body = fixture.Replace("-- TEST_BEFORE_EMIT", test.BeforeEmit ?? "", StringComparison.Ordinal) +
                       "\n" + test.Setup + "\nRAISERROR('TEST_ACTION_START',10,1) WITH NOWAIT;\n" + test.Sql;
            await using var command = new SqlCommand(body, connection, transaction) { CommandTimeout = 60 };
            await command.ExecuteNonQueryAsync();
            ok = test.Errors is not { Length: > 0 };
            if (!ok) detail = "La operacion prohibida fue aceptada.";
        }
        catch (SqlException error)
        {
            reachedAction |= error.Message.Contains("TEST_ACTION_START", StringComparison.Ordinal);
            var numbers = error.Errors.Cast<SqlError>().Select(e => e.Number).ToArray();
            ok = reachedAction && test.Errors is { Length: > 0 } && numbers.Intersect(test.Errors).Any();
            detail = ok ? "Rechazo esperado: " + string.Join(",", numbers) : error.Message;
        }
        catch (Exception error) { detail = error.Message; }
        finally
        {
            connection.InfoMessage -= onInfo;
            try { await transaction.RollbackAsync(); } catch (InvalidOperationException) { }
        }
        results.Add(new(test.Name, ok, detail));
        Console.WriteLine((ok ? "OK - " : "FALLO - ") + test.Name);
    }
    await File.WriteAllTextAsync(Path.Combine(artifacts, "integration-tests.json"), JsonSerializer.Serialize(results, jsonOptions));
    Assert(results.All(r => r.Passed), $"Fallaron {results.Count(r => !r.Passed)} de {results.Count} pruebas SQL.");
    await VerifyEmptyBusinessData(connection);

    // Persist a realistic request, original files, extraction, reviewed response
    // and audit, then prove that republishing preserves EVERY row byte-for-byte.
    Console.WriteLine("Actualizacion sobre datos historicos de prueba...");
    await CreateHistory(connection, fixture);
    var before = await Snapshot(connection);
    var sequenceBefore = await SequenceValue(connection);
    await connection.CloseAsync();
    await SqlPackage("Publish", null);
    await connection.OpenAsync();
    var after = await Snapshot(connection);
    Assert(JsonSerializer.Serialize(before) == JsonSerializer.Serialize(after), "El redespliegue modifico datos existentes.");
    Assert(sequenceBefore == await SequenceValue(connection), "El redespliegue reinicio la secuencia de productos.");
    await VerifySchema(connection);
    await File.WriteAllTextAsync(Path.Combine(artifacts, "data-preservation.json"), JsonSerializer.Serialize(before, jsonOptions));
    await connection.CloseAsync();

    var report = Path.Combine(artifacts, "after-republish.xml");
    await SqlPackage("DeployReport", report);
    var reportDocument = XDocument.Load(report);
    Assert(!reportDocument.Descendants().Any(e => e.Name.LocalName == "Operation"), "Quedo deriva de esquema tras redesplegar.");
    await File.WriteAllTextAsync(Path.Combine(artifacts, "verification.json"), JsonSerializer.Serialize(new
    {
        Database = database, FreshDatabase = true, IntegrationTests = results.Count,
        Failed = 0, RepublishPreservesData = true, RepublishPreservesSequence = true,
        SchemaDriftOperations = 0, SqlServer2022 = true
    }, jsonOptions));
    Console.WriteLine($"OK: base nueva, {results.Count} pruebas, redespliegue sin perdida y cero diferencias de esquema.");
}
finally
{
    if (created)
    {
        // Only the exact GUID name generated and checked absent by THIS process.
        Assert(Regex.IsMatch(database, "^GF_DB_TEST_[a-f0-9]{32}$", RegexOptions.CultureInvariant), "Nombre de limpieza no permitido.");
        SqlConnection.ClearAllPools();
        await using var master = new SqlConnection(masterSettings.ConnectionString);
        await master.OpenAsync();
        await using var check = new SqlCommand("SELECT COUNT(*) FROM sys.databases WHERE name=@name", master);
        check.Parameters.Add("@name", SqlDbType.NVarChar, 128).Value = database;
        if (Convert.ToInt32(await check.ExecuteScalarAsync()) == 1)
        {
            await using var drop = new SqlCommand($"ALTER DATABASE [{database}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [{database}];", master) { CommandTimeout = 60 };
            await drop.ExecuteNonQueryAsync();
        }
        cleaned = true;
        Console.WriteLine("Base temporal eliminada: " + database);
    }
    await File.WriteAllTextAsync(Path.Combine(artifacts, "cleanup.json"), JsonSerializer.Serialize(new { Database = database, Cleaned = cleaned }, jsonOptions));
}

async Task SqlPackage(string action, string? output)
{
    var start = new ProcessStartInfo("dotnet") { WorkingDirectory = root, UseShellExecute = false };
    foreach (var argument in new[] { "tool", "run", "sqlpackage", "/Action:" + action, "/SourceFile:" + dacpac,
                "/TargetConnectionString:" + targetSettings.ConnectionString, "/Profile:" + profile })
        start.ArgumentList.Add(argument);
    if (output != null) start.ArgumentList.Add("/OutputPath:" + output);
    using var process = Process.Start(start) ?? throw new InvalidOperationException("No se pudo ejecutar SqlPackage.");
    await process.WaitForExitAsync();
    Assert(process.ExitCode == 0, "SqlPackage fallo: " + action);
}

static async Task WaitForServer(SqlConnection connection)
{
    for (int attempt = 1; ; attempt++)
    {
        try { await connection.OpenAsync(); return; }
        catch (SqlException) when (attempt < 12)
        {
            Console.WriteLine("Esperando disponibilidad de SQL Server...");
            await Task.Delay(TimeSpan.FromSeconds(3));
        }
    }
}

static async Task<string> LoadFixture(string root) =>
    await File.ReadAllTextAsync(Path.Combine(root, "tests", "catalogo-pruebas.sql")) + "\n" +
    await File.ReadAllTextAsync(Path.Combine(root, "tests", "fixture-pruebas.sql"));

static async Task CreateHistory(SqlConnection connection, string fixture)
{
    await using var transaction = (SqlTransaction)await connection.BeginTransactionAsync();
    var body = fixture.Replace("-- TEST_BEFORE_EMIT", "", StringComparison.Ordinal) + """

    EXEC dbo.usp_Proforma_RevisarLinea @QD;
    EXEC dbo.usp_Proforma_Conciliar @Q,'Conciliada',N'Historia conservada durante despliegue';
    EXEC dbo.usp_Proforma_Validar @Q;
    """;
    await using var command = new SqlCommand(body, connection, transaction) { CommandTimeout = 60 };
    await command.ExecuteNonQueryAsync();
    await transaction.CommitAsync();
}

static async Task VerifySchema(SqlConnection connection)
{
    var expected = new Dictionary<string, int> { ["U"] = 16, ["P"] = 83, ["TR"] = 14, ["V"] = 2, ["FN"] = 1, ["SO"] = 1, ["PK"] = 16, ["F"] = 36, ["C"] = 79 };
    await using var command = new SqlCommand("SELECT RTRIM(type),COUNT(*) FROM sys.objects WHERE schema_id=SCHEMA_ID(N'dbo') AND is_ms_shipped=0 GROUP BY type", connection);
    await using (var reader = await command.ExecuteReaderAsync())
        while (await reader.ReadAsync())
            if (expected.Remove(reader.GetString(0), out var count)) Assert(reader.GetInt32(1) == count, "Cantidad de objetos incorrecta: " + reader.GetString(0));
    Assert(expected.Count == 0, "Faltan tipos de objeto esperados.");
    command.CommandText = """
    SELECT (SELECT COUNT(*) FROM sys.check_constraints WHERE is_disabled=1 OR is_not_trusted=1)
         + (SELECT COUNT(*) FROM sys.foreign_keys WHERE is_disabled=1 OR is_not_trusted=1)
         + (SELECT COUNT(*) FROM sys.triggers WHERE is_ms_shipped=0 AND is_disabled=1);
    """;
    Assert(Convert.ToInt32(await command.ExecuteScalarAsync()) == 0, "Restricciones/triggers sin verificar o deshabilitados.");
    command.CommandText = "SELECT CONVERT(int,SERVERPROPERTY('ProductMajorVersion'))";
    Assert(Convert.ToInt32(await command.ExecuteScalarAsync()) >= 16, "Requiere SQL Server 2022 o posterior.");
    command.CommandText = "SELECT CONVERT(nvarchar(128),DATABASEPROPERTYEX(DB_NAME(),'Collation'))";
    Assert(Convert.ToString(await command.ExecuteScalarAsync()) == "SQL_Latin1_General_CP1_CI_AS", "Collation inesperada.");
}

static async Task VerifyEmptyBusinessData(SqlConnection connection)
{
    var data = await Snapshot(connection);
    Assert(data.Where(x => x.Key != "UnidadesMedida").All(x => x.Value.Rows == 0), "Se cargaron datos de negocio en la instalacion o quedaron pruebas persistidas.");
    Assert(data["UnidadesMedida"].Rows == 5, "Se deben instalar exactamente cinco unidades tecnicas.");
}

static async Task<SortedDictionary<string, TableSnapshot>> Snapshot(SqlConnection connection)
{
    var tables = new List<(string Name, string PrimaryKey)>();
    await using var command = new SqlCommand("""
    SELECT t.name,c.name FROM sys.tables t JOIN sys.indexes i ON i.object_id=t.object_id AND i.is_primary_key=1
    JOIN sys.index_columns ic ON ic.object_id=i.object_id AND ic.index_id=i.index_id AND ic.key_ordinal=1
    JOIN sys.columns c ON c.object_id=ic.object_id AND c.column_id=ic.column_id
    WHERE t.is_ms_shipped=0 AND t.schema_id=SCHEMA_ID(N'dbo') ORDER BY t.name;
    """, connection);
    await using (var reader = await command.ExecuteReaderAsync())
        while (await reader.ReadAsync()) tables.Add((reader.GetString(0), reader.GetString(1)));
    var snapshots = new SortedDictionary<string, TableSnapshot>(StringComparer.Ordinal);
    foreach (var table in tables)
    {
        var name = "[dbo].[" + table.Name.Replace("]", "]]", StringComparison.Ordinal) + "]";
        var pk = "[" + table.PrimaryKey.Replace("]", "]]", StringComparison.Ordinal) + "]";
        command.CommandText = $"SELECT (SELECT COUNT_BIG(*) FROM {name}), (SELECT * FROM {name} ORDER BY {pk} FOR JSON PATH, INCLUDE_NULL_VALUES)";
        await using var reader = await command.ExecuteReaderAsync();
        await reader.ReadAsync();
        var json = reader.IsDBNull(1) ? "[]" : reader.GetString(1);
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(json)));
        snapshots[table.Name] = new(reader.GetInt64(0), hash);
    }
    return snapshots;
}

static async Task<string> SequenceValue(SqlConnection connection)
{
    await using var command = new SqlCommand("SELECT CONVERT(nvarchar(100),current_value) FROM sys.sequences WHERE name=N'SecCodigoProducto'", connection);
    return Convert.ToString(await command.ExecuteScalarAsync()) ?? "";
}

static void Assert(bool condition, string message)
{
    if (!condition) throw new InvalidOperationException(message);
}

record TestCase(string Name, string Sql, string? Setup, string? BeforeEmit, int[]? Errors);
record TestResult(string Name, bool Passed, string? Detail);
record TableSnapshot(long Rows, string Sha256);
record PersistenceBaseline(string Database, string Sequence, SortedDictionary<string, TableSnapshot> Tables);
