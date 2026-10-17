# SQL Server con Docker Compose

Entorno de desarrollo/pruebas con tres servicios separados:

- `sqlserver`: SQL Server 2022 CU27, puerto publicado solo en loopback y volumen persistente en `/var/opt/mssql`.
- `db-init`: inicializador que compila/publica el DACPAC, finaliza al terminar y no permanece como servidor. Su imagen final usa el runtime .NET y SqlPackage, sin SDK. Se ejecuta como usuario no root.
- `verify`: imagen con SDK y pruebas, disponible únicamente con el perfil `test`.

Las imágenes oficiales de SQL Server, SDK y runtime están fijadas por digest. El backend y frontend se adaptarán posteriormente.

## Inicio local

Requisitos: Docker con contenedores Linux, Docker Compose y PowerShell 7. La compilación ocurre dentro de Docker; no hace falta instalar .NET en el equipo para este recorrido.

Desde la carpeta `database`:

```powershell
./scripts/Invoke-DockerDatabase.ps1 -Action Up
./scripts/Invoke-DockerDatabase.ps1 -Action Status
```

La primera ejecución crea `docker/.env` con una contraseña aleatoria y compila el inicializador. Espera un healthcheck SQL autenticado, inicia SQL Server y publica la base `BDComprasFertilizantes`. Una base nueva contiene el modelo completo y las cinco unidades técnicas; no copia el catálogo ni los documentos de la instancia Windows.

Conexión desde SSMS u otro cliente:

- Servidor: `localhost,14333`.
- Autenticación SQL, usuario `sa`.
- Contraseña: la del archivo local `database/docker/.env`.
- Base: `BDComprasFertilizantes`.
- Cifrado activado y confianza en el certificado del servidor local.

`sa` se utiliza para administrar y publicar este entorno de desarrollo. El usuario de ejecución del backend se definirá al adaptar esa aplicación.

El archivo `.env` está excluido de Git y del contexto de compilación. Conservarlo al reutilizar el volumen: cambiar su contraseña escrita no cambia automáticamente la contraseña que ya tiene SQL Server. Puede generarse antes del arranque con `-Action Init`, o prepararse a partir de `.env.example`. Para cambiar puerto/base, editar `GF_SQL_PORT` o `GF_DATABASE_NAME` antes del arranque.

SQL Server reserva hasta 2 GB de memoria interna y el contenedor tiene límite de 3 GB. El puerto 14333 permite coexistir con la instancia SQL Server de Windows.

## Parada, arranque y actualización

```powershell
./scripts/Invoke-DockerDatabase.ps1 -Action Down
./scripts/Invoke-DockerDatabase.ps1 -Action Up
```

`Down` elimina los contenedores y la red del proyecto, **conservando el volumen y los datos**. `Up` vuelve a construir el inicializador si cambió el modelo y publica con las reglas del perfil portátil: bloquea pérdida de datos detectada y no recrea la base existente.

```powershell
./scripts/Invoke-DockerDatabase.ps1 -Action Logs
```

La edición utilizada es `Developer`, para desarrollo y pruebas. La selección de edición y configuración del uso real se resolverá antes de desplegar el producto para operación.

## Prueba automática de persistencia

```powershell
./scripts/Invoke-DockerDatabase.ps1 -Action Test
```

No utiliza la contraseña, la base ni el volumen del entorno local habitual. Genera un proyecto `gf-db-test-<guid>`, contraseña temporal, puerto libre y una base `GF_DB_COMPOSE_<guid>`.

El ciclo comprueba:

1. Compilación de las imágenes y creación del volumen/SQL Server.
2. Inicialización real con el servicio `db-init`.
3. Las 89 pruebas SQL sobre Linux, con otra base aleatoria que el ejecutor crea y elimina.
4. Una historia persistida de solicitud, archivos representados por metadatos, extracción, respuesta validada y auditoría.
5. Eliminación del contenedor SQL y creación de otro que reutiliza el mismo volumen.
6. Reaplicación del DACPAC mediante `db-init`, comparación de hashes de todas las filas y verificación de que la secuencia no retroceda ni genere un código existente.
7. Limpieza exclusiva de los contenedores, red y volumen del proyecto temporal generado.

Resultados: `database/artifacts/docker/<guid>/`, incluyendo `integration-tests.json`, `docker-verification.json`, `persistence-verified.json` y `compose-cleanup.json`. El CI ejecuta el mismo comando y publica esos archivos junto al DACPAC.

El ejecutor rechaza los modos de persistencia sobre bases cuyo nombre no sea el de una prueba Compose desechable. La parada del entorno habitual no usa la limpieza de volúmenes del recorrido de pruebas.

Los códigos no necesitan ser consecutivos: una secuencia con caché puede saltar valores al reiniciar SQL Server sin perder registros. La prueba comprueba continuidad y unicidad del siguiente código, permitiendo esos saltos esperados. Referencia: [gestión de caché de secuencias de SQL Server](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17#cache-management).

## Archivos y personalización

- `compose.yml`: servicios, volumen, healthcheck y puerto local.
- `Dockerfile`: etapas de compilación, pruebas y despliegue.
- `deploy.sh`: publicación de un único DACPAC, sin mostrar credenciales y rechazando bases de sistema.
- `.env.example`: campos de configuración, sin contraseña real.

El healthcheck y la dependencia `service_healthy` controlan disponibilidad; arrancar el proceso SQL no basta para garantizar que acepte conexiones. Referencias: [despliegue oficial de SQL Server en contenedores](https://learn.microsoft.com/en-us/sql/linux/containers/deploy?view=sql-server-ver17), [dependencias de Compose](https://docs.docker.com/compose/how-tos/startup-order/).
