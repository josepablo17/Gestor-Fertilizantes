[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$raiz = Split-Path $PSScriptRoot -Parent
$front = Join-Path $raiz 'Control-Fertilizantes-Frontend/control-fertilizantes-app'
$api = Join-Path $raiz 'Control-Fertilizantes-App/Control-Fertilizantes-Backend/Control-Fertilizantes-Backend'
$evidencia = Join-Path $raiz ('artifacts/frontend/' + [guid]::NewGuid().ToString('N'))

$conexion = [Data.Common.DbConnectionStringBuilder]::new()
$conexion.set_ConnectionString($env:GF_API_TEST_CONNECTION_STRING)
$base = $null
if (-not $conexion.TryGetValue('Database', [ref]$base)) {
    $null = $conexion.TryGetValue('Initial Catalog', [ref]$base)
}
if ($base -cnotmatch '^GF_DB_COMPOSE_[a-f0-9]{32}$') {
    throw 'La prueba de navegador solo admite una base temporal creada por Compose.'
}

function Nuevo-Puerto {
    $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
    $listener.Start()
    try { return $listener.LocalEndpoint.Port }
    finally { $listener.Stop() }
}

function Iniciar-Proceso([string]$Comando, [string]$Carpeta, [string[]]$Argumentos, [hashtable]$Variables) {
    $ruta = (Get-Command $Comando -CommandType Application | Select-Object -First 1).Source
    $info = [Diagnostics.ProcessStartInfo]::new($ruta)
    $info.WorkingDirectory = $Carpeta
    $info.UseShellExecute = $false
    $info.CreateNoWindow = $true
    $info.RedirectStandardOutput = $true
    $info.RedirectStandardError = $true
    foreach ($arg in $Argumentos) { $info.ArgumentList.Add($arg) }
    foreach ($par in $Variables.GetEnumerator()) { $info.Environment[$par.Key] = [string]$par.Value }
    $proc = [Diagnostics.Process]::Start($info)
    return @{ Proceso = $proc; Salida = $proc.StandardOutput.ReadToEndAsync(); Error = $proc.StandardError.ReadToEndAsync() }
}

function Esperar-Http([Net.Http.HttpClient]$Cliente, [string]$Url, $Ejecucion) {
    for ($intento = 0; $intento -lt 70; $intento++) {
        if ($Ejecucion.Proceso.HasExited) { throw "El servidor de prueba terminó antes de abrir $Url." }
        try {
            $respuesta = $Cliente.GetAsync($Url).GetAwaiter().GetResult()
            try { if ($respuesta.IsSuccessStatusCode) { return } } finally { $respuesta.Dispose() }
        } catch [Net.Http.HttpRequestException] {} catch [Threading.Tasks.TaskCanceledException] {}
        Start-Sleep -Milliseconds 300
    }
    throw "No respondió el servidor de prueba en $Url."
}

function Cerrar-Proceso($Ejecucion, [string]$Nombre) {
    if (-not $Ejecucion) { return }
    $proc = $Ejecucion.Proceso
    try {
        if (-not $proc.HasExited) { $proc.Kill($true) }
        $proc.WaitForExit()
        $Ejecucion.Salida.GetAwaiter().GetResult() | Set-Content -LiteralPath (Join-Path $evidencia "$Nombre.log") -Encoding utf8
        $Ejecucion.Error.GetAwaiter().GetResult() | Set-Content -LiteralPath (Join-Path $evidencia "$Nombre-error.log") -Encoding utf8
    } finally { $proc.Dispose() }
}

Push-Location $raiz
$servidorApi = $null
$servidorFront = $null
$pruebas = $null
$cliente = [Net.Http.HttpClient]::new()
$cliente.Timeout = [TimeSpan]::FromSeconds(2)
try {
    New-Item -ItemType Directory -Path $evidencia -Force | Out-Null
    $proyecto = Join-Path $api 'Control-Fertilizantes-Backend.csproj'
    if (-not (Test-Path -LiteralPath (Join-Path $front 'node_modules/playwright'))) {
        throw 'Ejecuta npm ci en la carpeta del frontend antes de la prueba.'
    }
    & dotnet restore $proyecto --locked-mode
    if ($LASTEXITCODE -ne 0) { throw 'Falló la restauración de la API.' }
    & dotnet build $proyecto -c Release --no-restore
    if ($LASTEXITCODE -ne 0) { throw 'Falló la compilación de la API.' }

    $apiUrl = "http://127.0.0.1:$(Nuevo-Puerto)"
    $puertoFront = Nuevo-Puerto
    $frontUrl = "http://127.0.0.1:$puertoFront"
    $servidorApi = Iniciar-Proceso 'dotnet' $api @((Join-Path $api 'bin/Release/net10.0/Control-Fertilizantes-Backend.dll')) @{
        ASPNETCORE_ENVIRONMENT = 'Development'
        ASPNETCORE_URLS = $apiUrl
        ConnectionStrings__ConexionSql = $env:GF_API_TEST_CONNECTION_STRING
        Documentos__RutaRaiz = Join-Path $evidencia 'documentos'
    }
    Esperar-Http $cliente "$apiUrl/swagger/v1/swagger.json" $servidorApi
    $servidorFront = Iniciar-Proceso 'node' $front @('node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', "$puertoFront", '--strictPort') @{
        GF_API_TARGET = $apiUrl
        VITE_API_URL = '/api'
    }
    Esperar-Http $cliente "$frontUrl/api/UnidadMedida/ListarUnidadMedida" $servidorFront

    $pruebas = Iniciar-Proceso 'node' $front @('pruebas/flujo-cotizacion.mjs') @{
        GF_FRONTEND_TEST_URL = $frontUrl
        GF_FRONTEND_TEST_DATABASE = $base
        GF_FRONTEND_E2E_ERROR = Join-Path $evidencia 'error.png'
    }
    if (-not $pruebas.Proceso.WaitForExit(180000)) { throw 'La prueba de navegador excedió el tiempo máximo.' }
    Write-Output $pruebas.Salida.GetAwaiter().GetResult()
    if ($pruebas.Proceso.ExitCode -ne 0) {
        Write-Output $pruebas.Error.GetAwaiter().GetResult()
        throw "Falló la prueba de navegador. Evidencia: $evidencia"
    }
    @{ Estado = 'Aprobado'; BaseTemporal = $base; Flujo = 'Catálogos, solicitud, PDF, revisión y comparación' } |
        ConvertTo-Json | Set-Content -LiteralPath (Join-Path $evidencia 'verificacion.json') -Encoding utf8
} finally {
    Cerrar-Proceso $pruebas 'navegador'
    Cerrar-Proceso $servidorFront 'vite'
    Cerrar-Proceso $servidorApi 'api'
    $cliente.Dispose()
    Pop-Location
}
