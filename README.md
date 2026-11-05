# Gestor de fertilizantes

Sistema local para solicitudes de cotización, recepción de proformas y comparación de precios. La base de datos ya contiene el modelo nuevo; la adaptación funcional del backend y del frontend continúa pendiente.

## Plataforma

- SDK **.NET 10.0.403**, fijado en `global.json` (sin versiones preliminares ni selección automática de otro SDK).
- Backend ASP.NET Core y ejecutor de pruebas SQL dirigidos a `net10.0`.
- PowerShell 7 para los comandos de verificación.
- Docker Desktop con contenedores Linux para el recorrido SQL en Compose.

Instalar el SDK indicado desde las [descargas oficiales de .NET 10](https://dotnet.microsoft.com/download/dotnet/10.0). El runtime solo no permite compilar. Si se usa el script oficial de instalación en una carpeta propia, agregar esa carpeta al `PATH` de la sesión y definir `DOTNET_ROOT` con su ruta. `dotnet --version`, ejecutado desde el repositorio, debe devolver `10.0.403`.

El `global.json` dentro de `database` conserva la misma versión porque su directorio es también el contexto independiente de construcción Docker. La comprobación del backend valida que ambas versiones coincidan.

## Backend

Desde la raíz del repositorio:

```powershell
./scripts/Probar-Backend.ps1
```

Restaura en modo bloqueado, compila en Release y arranca un proceso temporal de API. Comprueba OpenAPI, validación de modelos, una regla de negocio y carga sin archivo. No realiza operaciones SQL y detiene su proceso al terminar. Evidencia en `artifacts/backend/`.

Para desarrollar:

```powershell
dotnet run --project ./Control-Fertilizantes-App/Control-Fertilizantes-Backend/Control-Fertilizantes-Backend/Control-Fertilizantes-Backend.csproj --launch-profile http
```

Configurar la conexión con `ConnectionStrings__ConexionSql` en el entorno antes de usar endpoints que accedan a SQL. La migración a .NET 10 conserva las rutas y reglas actuales; no corrige todavía los contratos antiguos de productos, proformas, compras o comparación.

Los archivos generados `bin/obj` se excluyen de Git; deben regenerarse con el SDK actual. El backend tiene un archivo `packages.lock.json`; después de cambiar dependencias deliberadamente, regenerarlo con `dotnet restore --force-evaluate` y comprobar de nuevo la restauración `--locked-mode`.

La restauración detectó una dependencia transitiva vulnerable de SqlClient. Tanto la API como las pruebas fijan `System.Security.Cryptography.Pkcs` 10.0.14, versión corregida de los avisos [GHSA-2fmv-rv2c-59x7](https://github.com/advisories/GHSA-2fmv-rv2c-59x7) y [GHSA-846f-f764-76mx](https://github.com/advisories/GHSA-846f-f764-76mx). Los avisos de vulnerabilidad NuGet se tratan como errores; las advertencias previas de nulabilidad se revisarán al adaptar los módulos.

## Base de datos y Docker

Desde `database`:

```powershell
./scripts/Invoke-Database.ps1 -Action Build
./scripts/Invoke-DockerDatabase.ps1 -Action Up
./scripts/Invoke-DockerDatabase.ps1 -Action Test
```

El recorrido Docker compila con SDK 10.0.403 y despliega con runtime 10.0.14, ambos en Ubuntu Noble y fijados por digest. SqlPackage 170.5.96 sigue publicado para `net8.0`; se ejecuta con el runtime 10 mediante `DOTNET_ROLL_FORWARD=Major`. Esta compatibilidad se comprueba con publicación real y las pruebas SQL, sin instalar runtime 8 ni 9 en la imagen.

El motor SQL Server 2022, el esquema y la versión del DACPAC permanecen iguales. Los archivos originales, catálogos y datos existentes no se migran como parte de actualizar .NET.

Consultar [guía SQL](database/README.md), [guía Docker](database/docker/README.md) y [contratos para adaptar el backend](database/contracts/Contratos-backend.md).

## Integración continua

- `Backend .NET 10`: restauración bloqueada, compilación y cuatro comprobaciones HTTP.
- `Database DACPAC`: compilación SQL, 89 casos, verificación de conservación de datos y ciclo Compose con recreación del contenedor y el mismo volumen.

Referencias: [migración y cambios de .NET 10](https://learn.microsoft.com/dotnet/core/compatibility/10), [imágenes .NET 10 sobre Ubuntu](https://learn.microsoft.com/dotnet/core/compatibility/containers/10.0/default-images-use-ubuntu).
