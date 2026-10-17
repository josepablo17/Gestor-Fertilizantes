# Base de datos versionada — baseline 1.0.0

La fuente del esquema es **`GestorFertilizantes.Database/GestorFertilizantes.Database.sqlproj`**. Compila las definiciones declarativas a un DACPAC que crea una base vacía o calcula la actualización de una existente. Destino: SQL Server 2022, compatibilidad 160, collation `SQL_Latin1_General_CP1_CI_AS`.

Incluye 16 tablas de negocio, 83 procedimientos, 14 triggers, 2 vistas, 1 función y 1 secuencia, con sus llaves, índices y restricciones. Los archivos de tabla contienen también sus índices y triggers.

## Estructura

```text
database/
  .config/dotnet-tools.json                 SqlPackage fijado
  global.json                              SDK .NET fijado
  NuGet.Config                             Origen explícito de paquetes
  GestorFertilizantes.Database/
    GestorFertilizantes.Database.sqlproj    Modelo compilable; DAC 1.0.0.0
    packages.lock.json                     Referencia master de SQL Server 2022
    dbo/{Tables,StoredProcedures,...}/      Definiciones actuales
    ExtendedProperties.sql                 Versiones históricas de tablas/SP
    Scripts/PostDeployment.sql             Cinco unidades técnicas idempotentes
  Profiles/Portable.publish.xml            Reglas sin conexiones ni contraseñas
  scripts/Invoke-Database.ps1               Build / Plan / Publish / Test
  tests/                                   Datos propios y 89 casos SQL
  contracts/                               Referencia de integración con backend
  archive/                                 Migraciones previas congeladas
  artifacts/                               Resultados generados, fuera de Git
```

`archive` es evidencia de cambios ya aplicados, **no** un instalador previo al DACPAC. Desde esta baseline se editan los objetos del proyecto SQL; no mantener dos definiciones activas en migraciones manuales y en el `.sqlproj`.

## Compilación

Requisitos: SDK .NET **9.0.319**, PowerShell 7 y acceso inicial a NuGet. SQL Server 2022 o posterior solo es necesario para desplegar/probar. Se eligió el SDK disponible y verificado en este equipo; `global.json` exige esa versión y debe actualizarse deliberadamente cuando se renueve la herramienta.

Se fijaron `Microsoft.Build.Sql 2.3.0`, `Microsoft.SqlPackage 170.5.96`, `master 160.2.8` y `Microsoft.Data.SqlClient 6.1.5`. Los proyectos tienen archivos lock y restauración `--locked-mode`. SqlPackage puede usar el runtime .NET 9 del SDK sin instalar herramientas globales.

Desde `database`:

```powershell
./scripts/Invoke-Database.ps1 -Action Build
```

Genera `artifacts/package` con el DACPAC, `master.dacpac` de referencia, el perfil y un manifiesto de versión/SHA-256. La versión se deriva de `DacVersion` en el proyecto. El binario se distribuye por release/CI; Git conserva su fuente y dependencias, no el DACPAC generado.

## Plan y publicación

El perfil no guarda destinos o contraseñas. El script exige `GF_SQL_CONNECTION_STRING`. Ejemplo de conexión al equipo actual con autenticación Windows:

```powershell
$env:GF_SQL_CONNECTION_STRING = 'Server=localhost;Initial Catalog=BDComprasFertilizantes;Integrated Security=True;Encrypt=True;TrustServerCertificate=True;Connect Timeout=10'
./scripts/Invoke-Database.ps1 -Action Plan -SkipBuild
```

Genera `artifacts/deploy.sql` y `artifacts/deploy-report.xml` sin ejecutar el plan. Para otro destino, cambiar host, puerto y nombre de base en la conexión. En Linux/contenedores, suministrar autenticación SQL por variables del entorno de ejecución; no copiar credenciales a archivos versionados. La confianza del certificado del ejemplo corresponde al servidor local; ajustarla al entorno real.

Tras revisar el plan y disponer del respaldo correspondiente:

```powershell
./scripts/Invoke-Database.ps1 -Action Publish -SkipBuild
```

`Publish` vuelve a generar el plan antes de publicar. El perfil bloquea pérdida de datos detectada, evita recrear una base existente y no elimina objetos ajenos al modelo, permisos o miembros de roles. No cambia opciones físicas/operativas de una base existente. Para eliminar objetos retirados o transformar datos, planear operaciones explícitas; este perfil no es una limpieza automática de todo el destino.

La semilla instala KG, G, L, ML y UND si faltan, y rechaza discrepancias de dimensión/factor/unidad base en registros existentes. No reinterpreta unidades históricas ni actualiza sus nombres/estados. No incluye marcas, productos, proveedores o documentos de este equipo: una instalación nueva inicia sin datos de negocio, y las actualizaciones conservan los existentes.

## Prueba del ciclo completo

```powershell
./scripts/Invoke-Database.ps1 -Action Test -SkipBuild
```

Usa el servidor y credenciales de la variable, pero crea otra base `GF_DB_TEST_<guid>`. Comprueba que no existe antes de desplegar y elimina únicamente ese nombre generado por la misma ejecución. Nunca ejecuta las fixtures en la base indicada en la conexión.

Comprueba creación desde cero, objetos/collation/restricciones, cinco unidades técnicas y ausencia de filas de negocio; ejecuta 89 casos con catálogos sintéticos revertidos por caso. Después persiste una solicitud, metadatos PDF, extracción, respuesta validada y auditoría en esa base temporal, redespliega el mismo DACPAC y verifica hashes idénticos de todas las filas, conservación de la secuencia, cero operaciones pendientes y limpieza completada.

Evidencia: `artifacts/verification`. No ejecutar las fixtures SQL directamente. Las pruebas verifican SQL, no PDFs físicos, API o interfaz.

## CI

`.github/workflows/database.yml` compila y prueba cambios de `database` en Ubuntu, usando las mismas herramientas y un SQL Server 2022 CU27 desechable fijado por digest. Incluye además el ciclo Compose de inicialización, recreación del contenedor y conservación del volumen. Las contraseñas se generan durante las pruebas; no requiere acceso a una base del usuario. Las acciones están fijadas por SHA.

El artefacto queda asociado al commit e incluye DACPAC, perfil, manifiesto y resultados de ambos recorridos. El flujo no despliega en bases externas. La baseline ya pasó su primer CI real en GitHub; las ejecuciones del PR documentan el resultado correspondiente a cada revisión.

## Cambios posteriores

- Editar el objeto actual, compilar y ejecutar las pruebas.
- Incrementar `DacVersion` para una release y registrar el cambio en `CHANGELOG.md`. Conservar commit y manifiesto del artefacto desplegado.
- Para renombrar, usar un refactor log o una migración deliberada. El DACPAC no deduce la intención de un cambio de nombre.
- Para transformar datos, agregar scripts transaccionales e idempotentes y probar sobre datos previos; el modelo declarativo no sustituye esa lógica.
- Revisar el plan de cada destino y respaldar antes de aplicar cambios relevantes. Un DACPAC no contiene los datos de negocio ni reemplaza un backup; redesplegar una versión vieja no es una estrategia general de reversión de datos.

`SchemaVersion` y `ProceduresVersion` conservan los identificadores de las migraciones históricas. La nueva baseline de código/artefacto se identifica mediante `DacVersion`, manifiesto, commit y etiqueta; no se presenta esos dos identificadores antiguos como un journal de despliegues futuros.

## Docker Compose

El proyecto no incluye rutas MDF/LDF de Windows, usuarios ligados al equipo ni catálogos exportados. El mismo DACPAC/perfil permite desplegar en SQL Server 2022 sobre Linux indicando conexión y autenticación del entorno.

Ya hay servicios separados para SQL Server con volumen persistente, inicializador del DACPAC e imagen de pruebas. Desde esta carpeta:

```powershell
./scripts/Invoke-DockerDatabase.ps1 -Action Up
./scripts/Invoke-DockerDatabase.ps1 -Action Status
./scripts/Invoke-DockerDatabase.ps1 -Action Test
```

Ver [docker/README.md](docker/README.md) para conexión local, persistencia, reaplicación y evidencias. La parada habitual conserva el volumen. Backend y frontend no forman parte de estos servicios todavía.

## Resultado verificado

Compilación sin advertencias ni errores; base nueva de SQL Server 2022, **89 pruebas correctas**, datos/secuencia conservados al redesplegar, cero operaciones pendientes y base temporal eliminada. El plan contra `BDComprasFertilizantes` dio **cero operaciones de cambio en los objetos gestionados**: no se publicó ni se alteraron sus catálogos.

Las pruebas de baseline pasaron tanto sobre la instancia Windows como sobre SQL Server en Linux en el primer CI real. Las evidencias posteriores del PR y `artifacts/docker` documentan el recorrido Compose de cada ejecución.

Referencias: [Microsoft.Build.Sql](https://www.nuget.org/packages/Microsoft.Build.Sql/2.3.0), [referencias de sistema en proyectos SQL](https://learn.microsoft.com/en-us/sql/tools/sql-database-projects/concepts/system-objects?view=sql-server-ver17), [acciones de SqlPackage](https://learn.microsoft.com/en-us/sql/tools/sqlpackage/cli-reference?view=sql-server-ver17).
