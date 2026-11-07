[CmdletBinding()]
param([switch]$ConSql)

$ErrorActionPreference='Stop'
$repositoryRoot=Split-Path $PSScriptRoot -Parent
$backendRoot=Join-Path $repositoryRoot 'Control-Fertilizantes-App/Control-Fertilizantes-Backend/Control-Fertilizantes-Backend'
$project=Join-Path $backendRoot 'Control-Fertilizantes-Backend.csproj'
$testProject=Join-Path $repositoryRoot 'tests/GestorFertilizantes.Backend.Tests/GestorFertilizantes.Backend.Tests.csproj'
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
    if($ConSql -and [string]::IsNullOrWhiteSpace($env:GF_API_TEST_CONNECTION_STRING)){
        throw 'La prueba SQL requiere GF_API_TEST_CONNECTION_STRING.'
    }
    Invoke-DotNet -Arguments @('restore',$testProject,'--locked-mode')
    Invoke-DotNet -Arguments @('build',$testProject,'--configuration','Release','--no-restore')
    Invoke-DotNet -Arguments @('test',$testProject,'--configuration','Release','--no-build','--filter','Categoria!=Sql','--logger','trx;LogFileName=unitarias.trx','--results-directory',$artifactDirectory)
    if($ConSql){
        Invoke-DotNet -Arguments @('test',$testProject,'--configuration','Release','--no-build','--filter','Categoria=Sql','--logger','trx;LogFileName=integracion-sql.trx','--results-directory',$artifactDirectory)
    }

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
    $start.Environment['Documentos__RutaRaiz']=Join-Path $artifactDirectory ("documentos-http/" + [guid]::NewGuid().ToString('N'))
    $start.Environment['ConnectionStrings__ConexionSql']=if($ConSql){$env:GF_API_TEST_CONNECTION_STRING}else{'Server=127.0.0.1,1;Database=SinConexion;Integrated Security=True;Encrypt=True;Connect Timeout=1'}
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

    # Contrato versionado; revisar cualquier cambio antes de reemplazar la referencia.
    $contractPath=Join-Path $repositoryRoot 'tests/GestorFertilizantes.Backend.Tests/Contratos/openapi-v1.json'
    $expectedContract=Get-Content $contractPath -Raw | ConvertFrom-Json
    $expectedJson=$expectedContract | ConvertTo-Json -Depth 100 -Compress
    $actualJson=$openApi | ConvertTo-Json -Depth 100 -Compress
    if($actualJson -cne $expectedJson){
        $openApi | ConvertTo-Json -Depth 100 | Set-Content (Join-Path $artifactDirectory 'openapi-actual.json') -Encoding utf8
        throw 'OpenAPI cambio frente al contrato versionado. Revisar rutas, parametros y esquemas antes de actualizar la referencia.'
    }
    $checks.Add([ordered]@{Caso='Contrato OpenAPI coincide con la referencia versionada';Estado='Aprobado'})

    $content=[Net.Http.StringContent]::new('{}',[Text.Encoding]::UTF8,'application/json')
    try{
        $response=$client.PostAsync("$address/api/Producto/InsertarProducto",$content).GetAwaiter().GetResult()
        $body=$response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json
        if([int]$response.StatusCode -ne 400 -or $body.exito -ne $false -or [string]::IsNullOrWhiteSpace($body.mensaje)){
            throw 'El modelo invalido no produjo la respuesta HTTP 400 esperada.'
        }
        $checks.Add([ordered]@{Caso='Validacion HTTP de producto sin datos';Estado='Aprobado'})
    }finally{$content.Dispose();if($response){$response.Dispose();$response=$null}}

    $content=[Net.Http.StringContent]::new('{"codigo":"","nombre":""}',[Text.Encoding]::UTF8,'application/json')
    try{
        $response=$client.PostAsync("$address/api/presupuestos/rubros",$content).GetAwaiter().GetResult()
        $body=$response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json
        if([int]$response.StatusCode -ne 400 -or $body.exito -ne $false){throw 'El rubro incompleto no produjo HTTP 400.'}
        $checks.Add([ordered]@{Caso='Validacion HTTP de catalogo de presupuesto sin datos';Estado='Aprobado'})
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

    if($ConSql){
        try{
            $response=$client.GetAsync("$address/api/Producto/ObtenerProducto/2147483647").GetAwaiter().GetResult()
            $body=$response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json
            if([int]$response.StatusCode -ne 404 -or $body.mensaje -ne 'El recurso solicitado no existe.'){
                throw 'El error SQL de recurso inexistente no produjo HTTP 404 seguro.'
            }
            $checks.Add([ordered]@{Caso='SQL 52004 produce HTTP 404';Estado='Aprobado'})
        }finally{if($response){$response.Dispose();$response=$null}}
        try{
            $response=$client.GetAsync("$address/api/UnidadMedida/ListarUnidadMedida").GetAwaiter().GetResult()
            $body=$response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json
            if([int]$response.StatusCode -ne 200 -or @($body.data).Count -ne 5){throw 'El usuario de API no pudo consultar las unidades.'}
            $checks.Add([ordered]@{Caso='API consulta SQL con usuario limitado';Estado='Aprobado'})
        }finally{if($response){$response.Dispose();$response=$null}}
        foreach($caso in (& (Join-Path $PSScriptRoot 'Probar-CatalogosHttp.ps1') -Cliente $client -Direccion $address)){
            $checks.Add($caso)
        }
        foreach($caso in (& (Join-Path $PSScriptRoot 'Probar-SolicitudesHttp.ps1') -Cliente $client -Direccion $address -RutaDocumentos $start.Environment['Documentos__RutaRaiz'])){
            $checks.Add($caso)
        }
    }
    New-Item -ItemType Directory -Path $artifactDirectory -Force | Out-Null
    [ordered]@{Sdk=$sdk.sdk.version;TargetFramework=$runtime.runtimeOptions.tfm;Pruebas=$checks;ConexionBaseUtilizada=[bool]$ConSql} |
        ConvertTo-Json -Depth 6 | Set-Content (Join-Path $artifactDirectory 'verificacion.json') -Encoding utf8
    Write-Output "Backend .NET 10: $($checks.Count) comprobaciones HTTP aprobadas."
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
