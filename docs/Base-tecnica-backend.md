# Base técnica del backend

La API compila en .NET 10 con nulabilidad activada y advertencias como errores. Los contratos de búsqueda que pueden no encontrar un recurso declaran resultados anulables. Las unidades exigen sus textos obligatorios según SQL; los campos opcionales de respuestas históricas conservan null. No se usan supresiones ni valores ficticios para ocultar ausencias.

## Configuración local

Desde la raíz, con SDK 10.0.403, PowerShell 7 y Docker Linux:

    ./database/scripts/Invoke-DockerDatabase.ps1 -Action Up
    ./scripts/Iniciar-Backend.ps1

Up genera las claves que falten en database/docker/.env, publica el DACPAC y prepara la cuenta de aplicación. Después escribe ConnectionStrings:ConexionSql en appsettings.local.json del backend. No mostrar ni versionar el contenido de esos archivos.

El JSON se carga solo en Development; las variables de entorno y los argumentos prevalecen. En otros entornos debe configurarse ConnectionStrings__ConexionSql externamente. La validación ocurre al iniciar: sin servidor/base explícitos, con una base de sistema, cifrado desactivado, credenciales SQL incompletas o usuario sa, el proceso falla sin exponer la cadena de conexión.

La validación sintáctica no abre una conexión al arrancar. Disponibilidad y permisos se comprueban en integración. La confianza del certificado corresponde al entorno local.

## Cuenta SQL

- sa queda en publicación y preparación del entorno.
- La API usa gestor_api por defecto, configurable con GF_APP_SQL_USER y GF_APP_SQL_PASSWORD.
- El rol rol_gestor_api pertenece al proyecto SQL y concede EXECUTE sobre 82 procedimientos concretos. El comprobador JSON interno no está expuesto directamente.
- No se conceden permisos directos de tablas, esquema o administración, ni roles de servidor, db_owner, db_datareader o db_datawriter.
- Los procedimientos de negocio conservan su cadena de propiedad y las protecciones SQL. Una escritura por procedimiento puede estar permitida mientras la escritura directa se rechaza.
- Login, usuario, clave y SID se preparan por entorno fuera del DACPAC. El preparador parametriza los valores, escapa identificadores, no registra claves y no cambia contraseñas existentes.
- Si una cuenta o el rol ya tienen permisos adicionales no previstos, el preparador falla. El perfil publica los permisos declarados sin eliminar permisos o membresías ajenos al modelo.

SQL Server Developer y la confianza del certificado se mantienen para desarrollo y pruebas.

## Errores HTTP

| SQL | HTTP | Tratamiento |
|---|---|---|
| 52000, 51201–51203 | 400 | Datos o referencias inválidos |
| 52004, 51204 | 404 | Recurso inexistente |
| 52009 | 409 | Selección ambigua |
| 52010, 51200, 51205–51206 | 409 | Estado no permite la operación |
| 51100–51126 | 409 | Protección de integridad/documento |
| 2601, 2627, 547 | 409 | Unicidad o datos relacionados |
| Otros, incluidos permisos y firmas SQL incorrectas | 500 | Error técnico |

Se conservan los códigos históricos 50001–50005 durante la transición. El cuerpo usa ApiRespuesta y nombres JSON coherentes con la API. No se devuelve SqlException.Message: el cliente recibe mensajes públicos estables. El detalle se registra en servidor junto al identificador de solicitud. Una cancelación del cliente no se convierte en fallo interno y no se intenta sobrescribir una respuesta ya iniciada.

## Pruebas

    ./scripts/Probar-Backend.ps1
    ./database/scripts/Invoke-DockerDatabase.ps1 -Action Test -VerifyBackend

La primera orden ejecuta 60 pruebas unitarias y cuatro comprobaciones HTTP sin SQL. La segunda usa proyecto/base/login/volumen aleatorios propios. Comprueba instalación, 89 casos SQL, historia persistida, recreación del contenedor, nueva publicación y permisos de la cuenta. Luego arranca la API con esa cuenta y comprueba consultas y respuestas HTTP, además de los casos habituales.

Las pruebas SQL del backend verifican lectura y escritura por procedimientos (la escritura de prueba se revierte), rechazo de acceso directo/DDL y traducción de excepciones SQL reales sin revelar su mensaje interno. Solo aceptan la base temporal de Compose. La limpieza elimina sus recursos propios; Down normal conserva el volumen local.

Evidencia del backend: artifacts/backend/ (JSON y TRX). Evidencia SQL: database/artifacts/. Los workflows de CI ejecutan las verificaciones pertinentes.

## Alcance funcional

Quedan pendientes los DTOs y casos de uso de catálogos, solicitudes, documentos, recepción/revisión y comparación. Los contratos están en database/contracts/Contratos-backend.md. Un endpoint antiguo con una firma SQL incorrecta sigue siendo un fallo técnico, aunque el proyecto compile.

Referencias: [permisos de procedimientos SQL](https://learn.microsoft.com/sql/relational-databases/stored-procedures/grant-permissions-on-a-stored-procedure), [validación de opciones](https://learn.microsoft.com/aspnet/core/fundamentals/configuration/options).