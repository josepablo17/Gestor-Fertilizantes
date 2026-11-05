[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
$raiz=Split-Path $PSScriptRoot -Parent
$backend=Join-Path $raiz 'Control-Fertilizantes-App/Control-Fertilizantes-Backend/Control-Fertilizantes-Backend'
if(-not (Test-Path -LiteralPath (Join-Path $backend 'appsettings.local.json')) -and
   [string]::IsNullOrWhiteSpace($env:ConnectionStrings__ConexionSql)){
    throw 'Ejecutar database/scripts/Invoke-DockerDatabase.ps1 -Action Up o definir ConnectionStrings__ConexionSql.'
}
Push-Location $raiz
try{
    & dotnet run --project (Join-Path $backend 'Control-Fertilizantes-Backend.csproj') --launch-profile http
    if($LASTEXITCODE -ne 0){throw 'El backend no pudo iniciarse.'}
}finally{Pop-Location}
