[CmdletBinding()]
param()

$ErrorActionPreference='Stop'
$repositoryRoot=Split-Path $PSScriptRoot -Parent
$backendRoot=Join-Path $repositoryRoot 'Control-Fertilizantes-App/Control-Fertilizantes-Backend/Control-Fertilizantes-Backend'
$project=Join-Path $backendRoot 'Control-Fertilizantes-Backend.csproj'
$artifactDirectory=Join-Path $repositoryRoot 'artifacts/backend'
$process=$null
$client=$null

function Invoke-DotNet([string[]]$Arguments){
    & dotnet @Arguments
    if($LASTEXITCODE -ne 0){throw 'Fallo una herramienta .NET del backend.'}
}

Push-Location $repositoryRoot
try{
    $sdk=Get-Content (Join-Path $repositoryRoot 'global.json') -Raw | ConvertFrom-Json
    $databaseSdk=Get-Content (Join-Path $repositoryRoot 'database/global.json') -Raw | ConvertFrom-Json
    if($sdk.sdk.version -ne $databaseSdk.sdk.version){throw 'La API y la base deben usar el mismo SDK fijado.'}
    Invoke-DotNet -Arguments @('restore',$project,'--locked-mode')
    Invoke-DotNet -Arguments @('build',$project,'--configuration','Release','--no-restore')

    $assembly=Join-Path $backendRoot 'bin/Release/net10.0/Control-Fertilizantes-Backend.dll'
    $runtime=Get-Content (Join-Path $backendRoot 'bin/Release/net10.0/Control-Fertilizantes-Backend.runtimeconfig.json') -Raw | ConvertFrom-Json
    if($runtime.runtimeOptions.tfm -ne 'net10.0'){throw 'La API no fue compilada para .NET 10.'}

    # Puerto efimero y proceso propio; estas pruebas nunca usan una base real.
    $listener=[Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,0)
    $listener.Start()
    $port=$listener.LocalEndpoint.Port
    $listener.Stop()
    $address="http://127.0.0.1:$port"
    $dotnetCommand=Get-Command dotnet -CommandType Application | Select-Object -First 1
    $start=[Diagnostics.ProcessStartInfo]::new($dotnetCommand.Source)
    $start.ArgumentList.Add($assembly)
    $start.WorkingDirectory=$backendRoot
    $start.UseShellExecute=$false
    $start.CreateNoWindow=$true
    $start.RedirectStandardOutput=$true
    $start.RedirectStandardError=$true
    $start.Environment['ASPNETCORE_ENVIRONMENT']='Development'
    $start.Environment['ASPNETCORE_URLS']=$address
    $start.Environment['ConnectionStrings__ConexionSql']='Server=127.0.0.1,1;Database=SinConexion;Integrated Security=True;Connect Timeout=1'
    $process=[Diagnostics.Process]::Start($start)
    $stdout=$process.StandardOutput.ReadToEndAsync()
    $stderr=$process.StandardError.ReadToEndAsync()
    $client=[Net.Http.HttpClient]::new()
    $client.Timeout=[TimeSpan]::FromSeconds(3)

    $ready=$false
    for($attempt=0;$attempt -lt 40;$attempt++){
        if($process.HasExited){throw 'La API termino antes de aceptar solicitudes.'}
        try{
            $response=$client.GetAsync("$address/swagger/v1/swagger.json").GetAwaiter().GetResult()
            if([int]$response.StatusCode -eq 200){
                $openApi=$response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json
                if(-not $openApi.paths.'/api/Producto/InsertarProducto'){throw 'OpenAPI no contiene los endpoints de productos.'}
                $ready=$true
                break
            }
        }catch [Net.Http.HttpRequestException] {} catch [Threading.Tasks.TaskCanceledException] {}
        finally{if($response){$response.Dispose();$response=$null}}
        Start-Sleep -Milliseconds 500
    }
    if(-not $ready){throw 'La API no publico OpenAPI correctamente.'}

    $checks=[Collections.Generic.List[object]]::new()
    $checks.Add([ordered]@{Caso='Arranque y OpenAPI bajo .NET 10';Estado='Aprobado'})

    $content=[Net.Http.StringContent]::new('{}',[Text.Encoding]::UTF8,'application/json')
    try{
        $response=$client.PostAsync("$address/api/Producto/InsertarProducto",$content).GetAwaiter().GetResult()
        $body=$response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json
        if([int]$response.StatusCode -ne 400 -or $body.exito -ne $false -or [string]::IsNullOrWhiteSpace($body.mensaje)){
            throw 'El modelo invalido no produjo la respuesta HTTP 400 esperada.'
        }
        $checks.Add([ordered]@{Caso='Validacion HTTP de producto sin datos';Estado='Aprobado'})
    }finally{$content.Dispose();if($response){$response.Dispose();$response=$null}}

    try{
        $response=$client.GetAsync("$address/api/Producto/ObtenerProducto/0").GetAwaiter().GetResult()
        $body=$response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json
        if([int]$response.StatusCode -ne 400 -or $body.exito -ne $false){throw 'La regla de negocio no produjo HTTP 400.'}
        $checks.Add([ordered]@{Caso='Servicio y middleware rechazan ID invalido';Estado='Aprobado'})
    }finally{if($response){$response.Dispose();$response=$null}}

    $content=[Net.Http.MultipartFormDataContent]::new()
    try{
        $response=$client.PostAsync("$address/api/CompraAutomatica/VistaPreviaValidada",$content).GetAwaiter().GetResult()
        if([int]$response.StatusCode -ne 400){throw 'La carga sin PDF no produjo HTTP 400.'}
        $checks.Add([ordered]@{Caso='Formulario sin archivo PDF rechazado';Estado='Aprobado'})
    }finally{$content.Dispose();if($response){$response.Dispose();$response=$null}}

    New-Item -ItemType Directory -Path $artifactDirectory -Force | Out-Null
    [ordered]@{Sdk=$sdk.sdk.version;TargetFramework=$runtime.runtimeOptions.tfm;Pruebas=$checks;ConexionBaseUtilizada=$false} |
        ConvertTo-Json -Depth 6 | Set-Content (Join-Path $artifactDirectory 'verificacion.json') -Encoding utf8
    Write-Output 'Backend .NET 10: 4 comprobaciones HTTP aprobadas, sin operaciones SQL.'
}finally{
    if($client){$client.Dispose()}
    if($process){
        if(-not $process.HasExited){$process.Kill($true)}
        $process.WaitForExit()
        if($stdout -and $stderr){
            New-Item -ItemType Directory -Path $artifactDirectory -Force | Out-Null
            $stdout.GetAwaiter().GetResult() | Set-Content (Join-Path $artifactDirectory 'servidor.log') -Encoding utf8
            $stderr.GetAwaiter().GetResult() | Set-Content (Join-Path $artifactDirectory 'servidor-error.log') -Encoding utf8
        }
        $process.Dispose()
    }
    Pop-Location
}
