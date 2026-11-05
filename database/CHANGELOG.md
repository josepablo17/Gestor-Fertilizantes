# Historial de la base de datos

## 1.0.1 — 2026-11-05

- Rol versionado de ejecución con permisos sobre 82 procedimientos públicos.
- Perfil portátil publica permisos declarados y conserva usuarios/membresías locales.
- Inicializador prepara la cuenta de ejecución sin permisos administrativos ni cambios implícitos de contraseña.
- Conexión privada de API hacia Docker y pruebas de permisos reales.
- Se conservan tablas y procedimientos del modelo de negocio.

## Plataforma .NET 10 — 2026-11-05

- SDK 10.0.403 fijado y ejecutor de pruebas dirigido a net10.0.
- Imágenes de SDK/runtime .NET 10 sobre Ubuntu Noble, fijadas por digest.
- SqlPackage 170.5.96 usa el runtime 10 mediante roll-forward.
- Se conserva SQL Server 2022, el esquema y DacVersion 1.0.0.0.

## Infraestructura Docker y CI — 2026-10-16

- Rama de trabajo y PR para revisar la baseline antes de integrar a main.
- Primer CI real en GitHub completado correctamente con las 89 pruebas sobre SQL Server Linux.
- Compose con volumen persistente, healthcheck autenticado e inicializador separado sin SDK en la imagen final.
- Herramienta de arranque/parada y pruebas de recreación de contenedor, conservación de todas las filas y reaplicación del DACPAC.
- El CI incorpora ese mismo ciclo Compose y sus evidencias. El esquema y DacVersion 1.0.0.0 no cambian en esta etapa de infraestructura.

## 1.0.0 — 2026-10-16

- Primera baseline declarativa del modelo de cotizaciones v1 y procedimientos v2.
- Proyecto Microsoft.Build.Sql para SQL Server 2022 y compilación a DACPAC.
- Publicación portátil sin rutas físicas del equipo original, credenciales versionadas o catálogos exportados.
- Semilla idempotente de cinco unidades técnicas.
- Herramientas/dependencias fijadas, archivos lock y comandos de compilación, plan y publicación.
- 89 pruebas portables, despliegue desde cero, conservación de datos/secuencia al redesplegar y comprobación de deriva.
- CI preparado y migraciones históricas conservadas en archive.

Backend y frontend todavía deben adaptarse. Docker local y el workflow remoto no se ejecutaron en esta etapa.
