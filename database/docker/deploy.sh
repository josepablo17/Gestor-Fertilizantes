#!/usr/bin/env bash
set -euo pipefail

: "${GF_SQL_SERVER:?Defina el servidor SQL de destino}"
: "${GF_DATABASE_NAME:?Defina el nombre de la base}"
: "${MSSQL_SA_PASSWORD:?Defina la contrasena SQL por el entorno}"

if [[ ! "$GF_DATABASE_NAME" =~ ^[A-Za-z][A-Za-z0-9_]*$ ]]; then
  echo 'Nombre de base invalido: utilice letras, numeros y guion bajo.' >&2
  exit 1
fi
case "${GF_DATABASE_NAME,,}" in
  master|model|msdb|tempdb) echo 'No se publica en bases de sistema.' >&2; exit 1 ;;
esac

# Never print the password or connection string. Compose waits for a successful
# authenticated SQL health check before starting this service.
exec dotnet /app/sqlpackage/sqlpackage.dll \
  /Action:Publish \
  /SourceFile:/app/GestorFertilizantes.Database.dacpac \
  /Profile:/app/Portable.publish.xml \
  "/TargetServerName:$GF_SQL_SERVER" \
  "/TargetDatabaseName:$GF_DATABASE_NAME" \
  /TargetUser:sa \
  "/TargetPassword:$MSSQL_SA_PASSWORD" \
  /TargetEncryptConnection:True \
  /TargetTrustServerCertificate:True
