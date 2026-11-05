using System.Data;
using System.Text.RegularExpressions;
using Microsoft.Data.SqlClient;

try
{
    var servidor = Requerir("GF_SQL_SERVER");
    var baseDatos = Requerir("GF_DATABASE_NAME");
    var usuario = Requerir("GF_APP_SQL_USER");
    var clave = Requerir("GF_APP_SQL_PASSWORD");
    if (!Regex.IsMatch(baseDatos, "^[A-Za-z][A-Za-z0-9_]*$") ||
        new[] { "master", "model", "msdb", "tempdb" }.Contains(baseDatos, StringComparer.OrdinalIgnoreCase) ||
        !Regex.IsMatch(usuario, "^[a-z][a-z0-9_]{2,63}$") || usuario == "sa" ||
        clave.Length < 20 || clave.Length > 128)
        throw new InvalidOperationException("Nombre de base, usuario o longitud de clave de aplicacion invalidos.");

    var ajustes = new SqlConnectionStringBuilder
    {
        DataSource = servidor, InitialCatalog = baseDatos, UserID = "sa",
        Password = Requerir("MSSQL_SA_PASSWORD"), Encrypt = SqlConnectionEncryptOption.Mandatory,
        TrustServerCertificate = true, ConnectTimeout = 10, Pooling = false
    };
    await using var administrador = new SqlConnection(ajustes.ConnectionString);
    await administrador.OpenAsync();
    await using (var comprobacion = new SqlCommand("SELECT COUNT(*) FROM sys.server_principals WHERE name=@Usuario;", administrador))
    {
        comprobacion.Parameters.Add("@Usuario", SqlDbType.NVarChar, 128).Value = usuario;
        if (Convert.ToInt32(await comprobacion.ExecuteScalarAsync()) != 0)
        {
            // Verificar credenciales antes de tocar una cuenta existente; no rotarlas implicitamente.
            var existente = new SqlConnectionStringBuilder(ajustes.ConnectionString)
                { InitialCatalog = "master", UserID = usuario, Password = clave };
            await using var autenticacion = new SqlConnection(existente.ConnectionString);
            await autenticacion.OpenAsync();
        }
    }
    await using var comando = new SqlCommand("""
        SET XACT_ABORT ON;
        IF DATABASE_PRINCIPAL_ID(N'rol_gestor_api') IS NULL THROW 53000,N'Falta publicar el rol de aplicacion.',1;
        IF EXISTS(SELECT 1 FROM sys.database_role_members WHERE member_principal_id=DATABASE_PRINCIPAL_ID(N'rol_gestor_api'))
            THROW 53000,N'El rol de aplicacion hereda otros roles.',1;
        IF EXISTS(SELECT 1 FROM sys.schemas WHERE principal_id=DATABASE_PRINCIPAL_ID(N'rol_gestor_api'))
            THROW 53000,N'El rol de aplicacion no debe ser propietario de esquemas.',1;
        IF EXISTS(SELECT 1 FROM sys.objects WHERE principal_id=DATABASE_PRINCIPAL_ID(N'rol_gestor_api'))
            THROW 53000,N'El rol de aplicacion no debe ser propietario de objetos.',1;
        IF EXISTS(SELECT 1 FROM sys.database_permissions p WHERE p.grantee_principal_id=DATABASE_PRINCIPAL_ID(N'rol_gestor_api')
            AND (p.class<>1 OR p.permission_name<>N'EXECUTE' OR p.state<>'G' OR NOT EXISTS(
                SELECT 1 FROM sys.procedures sp WHERE sp.object_id=p.major_id AND sp.schema_id=SCHEMA_ID(N'dbo')
                AND sp.name<>N'usp_Proforma_ComprobarJson')))
            THROW 53000,N'El rol tiene permisos adicionales no previstos.',1;
        IF EXISTS(SELECT 1 FROM sys.server_role_members WHERE member_principal_id=SUSER_ID(@Usuario))
            THROW 53000,N'La cuenta existente pertenece a un rol de servidor.',1;
        IF EXISTS(SELECT 1 FROM sys.server_permissions WHERE grantee_principal_id=SUSER_ID(@Usuario)
                  AND permission_name<>N'CONNECT SQL')
            THROW 53000,N'La cuenta existente tiene permisos de servidor adicionales.',1;
        IF EXISTS(SELECT 1 FROM sys.server_principals WHERE name=@Usuario AND (type<>'S' OR is_disabled=1))
            THROW 53000,N'La cuenta existente no es un login SQL activo.',1;
        BEGIN TRANSACTION;
        BEGIN TRY
            IF SUSER_ID(@Usuario) IS NULL
            BEGIN
                DECLARE @CrearLogin nvarchar(max)=N'CREATE LOGIN '+QUOTENAME(@Usuario)+
                    N' WITH PASSWORD=N'''+REPLACE(@Clave,N'''',N'''''')+
                    N''', CHECK_POLICY=ON, CHECK_EXPIRATION=OFF, DEFAULT_DATABASE='+QUOTENAME(DB_NAME())+N';';
                EXEC(@CrearLogin);
            END;
            IF DATABASE_PRINCIPAL_ID(@Usuario) IS NULL
            BEGIN
                DECLARE @CrearUsuario nvarchar(max)=N'CREATE USER '+QUOTENAME(@Usuario)+N' FOR LOGIN '+QUOTENAME(@Usuario)+N';';
                EXEC(@CrearUsuario);
            END;
            ELSE IF EXISTS(SELECT 1 FROM sys.database_principals WHERE name=@Usuario AND sid<>SUSER_SID(@Usuario))
                THROW 53000,N'El usuario existente pertenece a otra identidad.',1;
            IF EXISTS(SELECT 1 FROM sys.database_role_members m JOIN sys.database_principals r ON r.principal_id=m.role_principal_id
                WHERE m.member_principal_id=DATABASE_PRINCIPAL_ID(@Usuario) AND r.name<>N'rol_gestor_api')
                THROW 53000,N'El usuario existente tiene otros roles.',1;
            IF EXISTS(SELECT 1 FROM sys.database_permissions WHERE grantee_principal_id=DATABASE_PRINCIPAL_ID(@Usuario)
                AND permission_name<>N'CONNECT')
                THROW 53000,N'El usuario existente tiene permisos directos adicionales.',1;
            IF EXISTS(SELECT 1 FROM sys.schemas WHERE principal_id=DATABASE_PRINCIPAL_ID(@Usuario))
                THROW 53000,N'El usuario existente es propietario de un esquema.',1;
            IF EXISTS(SELECT 1 FROM sys.objects WHERE principal_id=DATABASE_PRINCIPAL_ID(@Usuario))
                THROW 53000,N'El usuario existente es propietario de objetos.',1;
            IF NOT EXISTS(SELECT 1 FROM sys.database_role_members WHERE role_principal_id=DATABASE_PRINCIPAL_ID(N'rol_gestor_api')
                AND member_principal_id=DATABASE_PRINCIPAL_ID(@Usuario))
            BEGIN
                DECLARE @AgregarMiembro nvarchar(max)=N'ALTER ROLE [rol_gestor_api] ADD MEMBER '+QUOTENAME(@Usuario)+N';';
                EXEC(@AgregarMiembro);
            END;
            COMMIT;
        END TRY
        BEGIN CATCH
            IF XACT_STATE()<>0 ROLLBACK;
            THROW;
        END CATCH;
        """, administrador);
    comando.Parameters.Add("@Usuario", SqlDbType.NVarChar, 128).Value = usuario;
    comando.Parameters.Add("@Clave", SqlDbType.NVarChar, 128).Value = clave;
    await comando.ExecuteNonQueryAsync();
    Console.WriteLine("Cuenta de ejecucion preparada sin permisos administrativos.");
    return 0;
}
catch (SqlException excepcion)
{
    Console.Error.WriteLine($"No se pudo preparar la cuenta de aplicacion. Codigo SQL: {excepcion.Number}. Verifique las credenciales y permisos; no se cambia la clave de cuentas existentes.");
    return 1;
}
catch (InvalidOperationException excepcion)
{
    Console.Error.WriteLine(excepcion.Message);
    return 1;
}

static string Requerir(string nombre) =>
    Environment.GetEnvironmentVariable(nombre) is { Length: > 0 } valor
        ? valor : throw new InvalidOperationException($"Falta la variable {nombre}.");
