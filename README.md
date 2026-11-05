# Gestor de fertilizantes

Sistema local para solicitudes de cotización, recepción de proformas y comparación de precios. La base contiene el modelo nuevo; la adaptación funcional del backend y del frontend continúa pendiente.

## Plataforma

SDK .NET **10.0.403**, fijado en global.json de raíz y database; API y pruebas dirigidas a net10.0. Se requieren PowerShell 7 y Docker Linux para el recorrido completo. El contexto SQL conserva su global.json porque se construye independientemente en Docker.

Instalar el SDK desde las [descargas oficiales](https://dotnet.microsoft.com/download/dotnet/10.0). Si se instala en una carpeta propia, agregarla al PATH y definir DOTNET_ROOT. Desde el repositorio, dotnet --version debe devolver 10.0.403.

## Uso local

Desde la raíz:

    ./database/scripts/Invoke-DockerDatabase.ps1 -Action Up
    ./scripts/Iniciar-Backend.ps1

Up prepara el usuario SQL limitado y la conexión del backend en appsettings.local.json. Ese archivo está excluido de Git y de publicación. La API lo carga solo en Development; ConnectionStrings__ConexionSql y los argumentos tienen prioridad. Fuera de Development se requiere configuración externa. La API valida la conexión al arrancar y rechaza configuración vacía, bases de sistema, ausencia de cifrado y usuario sa.

Las rutas y reglas antiguas aún deben adaptarse a los contratos SQL nuevos. Consultar los [contratos](database/contracts/Contratos-backend.md).

## Verificación

    ./scripts/Probar-Backend.ps1
    ./database/scripts/Invoke-DockerDatabase.ps1 -Action Test -VerifyBackend

La primera orden restaura en modo bloqueado, compila sin advertencias, ejecuta 60 pruebas unitarias y cuatro comprobaciones HTTP sin SQL. La segunda verifica el DACPAC, 89 casos SQL, persistencia en Docker y la API con permisos reales de su usuario limitado. Usa recursos temporales propios que elimina al terminar.

Las 14 advertencias previas de nulabilidad se corrigieron sin supresiones. Todas las advertencias se tratan como errores. Los archivos generados bin/obj están fuera de Git. Los cambios deliberados de paquetes requieren actualizar su packages.lock.json y comprobar la restauración --locked-mode.

La API y las pruebas fijan System.Security.Cryptography.Pkcs 10.0.14 para corregir los avisos transitivos detectados: [GHSA-2fmv-rv2c-59x7](https://github.com/advisories/GHSA-2fmv-rv2c-59x7), [GHSA-846f-f764-76mx](https://github.com/advisories/GHSA-846f-f764-76mx).

## Base de datos

El DACPAC 1.0.1.0 agrega el rol rol_gestor_api y permisos EXECUTE sobre 82 procedimientos públicos. No concede acceso directo a tablas ni administración. Usuarios, contraseñas y SIDs se preparan fuera del DACPAC. Se conserva SQL Server 2022 y el modelo de negocio.

Docker usa SDK 10.0.403 y runtime 10.0.14 sobre Ubuntu Noble, fijados por digest. SqlPackage 170.5.96, distribuido para net8.0, se ejecuta sobre runtime 10 mediante DOTNET_ROLL_FORWARD=Major. No es necesario instalar runtime 8 o 9 en las imágenes.

Consultar [guía SQL](database/README.md), [guía Docker](database/docker/README.md) y [base técnica del backend](docs/Base-tecnica-backend.md).

## Integración continua

- Backend .NET 10: restauración bloqueada, compilación, pruebas unitarias y comprobaciones HTTP.
- Database DACPAC: compilación SQL, 89 casos, conservación de datos y ciclo Compose con recreación del contenedor; integra además las pruebas de permisos y de la API.

Referencias: [cambios de .NET 10](https://learn.microsoft.com/dotnet/core/compatibility/10), [imágenes sobre Ubuntu](https://learn.microsoft.com/dotnet/core/compatibility/containers/10.0/default-images-use-ubuntu).