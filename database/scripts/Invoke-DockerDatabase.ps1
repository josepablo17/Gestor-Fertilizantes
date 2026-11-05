[CmdletBinding()]
param([ValidateSet('Init','Up','Down','Status','Logs','Test')][string]$Action='Up',
      [switch]$VerifyBackend)
$ErrorActionPreference='Stop'
$databaseRoot=Split-Path $PSScriptRoot -Parent
$dockerDirectory=Join-Path $databaseRoot 'docker'
$composeFile=Join-Path $dockerDirectory 'compose.yml'
$environmentFile=Join-Path $dockerDirectory '.env'
$project='gestor-fertilizantes-db'
$composeArguments=@()

function Invoke-Compose([string[]]$Arguments){
    & docker compose @composeArguments @Arguments
    if($LASTEXITCODE -ne 0){throw 'Fallo Docker Compose. Revisar el diagnostico anterior.'}
}
function Initialize-LocalEnvironment{
    if(-not (Test-Path -LiteralPath $environmentFile)){
        $password='Db!'+[Guid]::NewGuid().ToString('N')+'aA9'
        $contents="MSSQL_SA_PASSWORD=$password`nGF_DATABASE_NAME=BDComprasFertilizantes`nGF_SQL_PORT=14333`n"
        [IO.File]::WriteAllText($environmentFile,$contents,[Text.UTF8Encoding]::new($false))
        Write-Output 'Configuracion local creada en database/docker/.env (excluida de Git).'
    }
    $contenido=Get-Content -LiteralPath $environmentFile -Raw
    if($contenido -notmatch '(?m)^GF_APP_SQL_USER=.+'){
        Add-Content -LiteralPath $environmentFile -Value "GF_APP_SQL_USER=gestor_api" -Encoding utf8
    }
    if($contenido -notmatch '(?m)^GF_APP_SQL_PASSWORD=.+'){
        $clave='Api!'+[Guid]::NewGuid().ToString('N')+'aA9'
        Add-Content -LiteralPath $environmentFile -Value "GF_APP_SQL_PASSWORD=$clave" -Encoding utf8
    }
}
function Write-BackendConfiguration{
    $json=& docker compose @composeArguments config --format json
    if($LASTEXITCODE -ne 0){throw 'No se pudo resolver la configuracion de Docker.'}
    $configuracion=($json|Out-String)|ConvertFrom-Json
    $inicializador=$configuracion.services.'db-init'.environment
    $puerto=$configuracion.services.sqlserver.ports[0].published
    $cadena=[Data.Common.DbConnectionStringBuilder]::new()
    $cadena['Server']="127.0.0.1,$puerto"
    $cadena['Initial Catalog']=$inicializador.GF_DATABASE_NAME
    $cadena['User ID']=$inicializador.GF_APP_SQL_USER
    $cadena['Password']=$inicializador.GF_APP_SQL_PASSWORD
    $cadena['Encrypt']=$true
    $cadena['TrustServerCertificate']=$true
    $archivo=Join-Path (Split-Path $databaseRoot -Parent) 'Control-Fertilizantes-App/Control-Fertilizantes-Backend/Control-Fertilizantes-Backend/appsettings.local.json'
    $opciones=if(Test-Path -LiteralPath $archivo){Get-Content $archivo -Raw|ConvertFrom-Json -AsHashtable}else{@{}}
    $opciones['ConnectionStrings']=@{ConexionSql=$cadena.ConnectionString}
    [IO.File]::WriteAllText($archivo,($opciones|ConvertTo-Json -Depth 10),[Text.UTF8Encoding]::new($false))
    Write-Output 'Conexion del backend preparada en appsettings.local.json, excluida de Git y de publicacion.'
}
function Get-SqlContainerId{
    $containerId=(Invoke-Compose -Arguments @('ps','--quiet','sqlserver') | Out-String).Trim()
    if([string]::IsNullOrWhiteSpace($containerId)){throw 'No se encontro el contenedor SQL.'}
    return $containerId
}
function Get-SqlVolume([string]$ContainerId){
    $mountJson=& docker inspect --format '{{json .Mounts}}' $ContainerId
    if($LASTEXITCODE -ne 0){throw 'No se pudo inspeccionar el volumen SQL.'}
    $mounts=@($mountJson|ConvertFrom-Json)
    $volume=$mounts|Where-Object {$_.Destination -eq '/var/opt/mssql' -and $_.Type -eq 'volume'}
    if(-not $volume){throw 'SQL Server no usa el volumen persistente esperado.'}
    return [string]$volume.Name
}

if($Action -eq 'Init'){Initialize-LocalEnvironment;return}
if($Action -ne 'Test'){
    if($Action -eq 'Up'){Initialize-LocalEnvironment}
    if(-not (Test-Path -LiteralPath $environmentFile)){throw 'Ejecutar primero -Action Init o -Action Up.'}
    $composeArguments=@('--project-name',$project,'--env-file',$environmentFile,'--file',$composeFile)
    switch($Action){
        'Up'{
            Invoke-Compose -Arguments @('build','db-init')
            Invoke-Compose -Arguments @('up','--detach','--wait','--wait-timeout','210','sqlserver')
            Invoke-Compose -Arguments @('run','--rm','--no-deps','db-init')
            Write-BackendConfiguration
            Write-Output 'Base disponible en localhost,14333 salvo que GF_SQL_PORT se haya cambiado en .env.'
        }
        # Deliberately omit --volumes: normal shutdown always preserves data.
        'Down'{Invoke-Compose -Arguments @('down')}
        'Status'{Invoke-Compose -Arguments @('ps','--all')}
        'Logs'{Invoke-Compose -Arguments @('logs','--tail','120','sqlserver')}
    }
    return
}

# Only this branch creates a random, isolated project and is allowed to delete
# its own volume. Never accept a caller-provided name for destructive cleanup.
$runId=[Guid]::NewGuid().ToString('N')
$project='gf-db-test-'+$runId
$artifactDirectory=Join-Path $databaseRoot ('artifacts/docker/'+$runId)
New-Item -ItemType Directory -Path $artifactDirectory -Force | Out-Null
$keys=@('MSSQL_SA_PASSWORD','GF_DATABASE_NAME','GF_SQL_PORT','GF_DOCKER_ARTIFACTS_PATH','GF_APP_SQL_USER','GF_APP_SQL_PASSWORD','GF_API_TEST_CONNECTION_STRING')
$previousEnvironment=@{}
foreach($key in $keys){$previousEnvironment[$key]=[Environment]::GetEnvironmentVariable($key)}
$owned=$false
$cleaned=$false
try{
    $env:MSSQL_SA_PASSWORD='Ci!'+[Guid]::NewGuid().ToString('N')+'aA9'
    $env:GF_DATABASE_NAME='GF_DB_COMPOSE_'+$runId
    $env:GF_APP_SQL_USER='api_test_'+$runId
    $env:GF_APP_SQL_PASSWORD='Api!'+[Guid]::NewGuid().ToString('N')+'aA9'
    if($env:GITHUB_ACTIONS -eq 'true'){
        Write-Output "::add-mask::$env:MSSQL_SA_PASSWORD"
        Write-Output "::add-mask::$env:GF_APP_SQL_PASSWORD"
    }
    # Port 0 asks Docker to choose a free loopback port, avoiding the local SQL instance.
    $env:GF_SQL_PORT='0'
    $env:GF_DOCKER_ARTIFACTS_PATH=$artifactDirectory.Replace('\','/')
    $composeArguments=@('--project-name',$project,'--env-file',(Join-Path $dockerDirectory '.env.example'),'--file',$composeFile,'--profile','test')
    $existingContainers=& docker ps --all --quiet --filter "label=com.docker.compose.project=$project"
    if($LASTEXITCODE -ne 0){throw 'Docker no esta disponible.'}
    $existingVolumes=& docker volume ls --quiet --filter "label=com.docker.compose.project=$project"
    if($LASTEXITCODE -ne 0){throw 'No se pudieron verificar los volumenes existentes.'}
    if($existingContainers -or $existingVolumes){throw 'El proyecto aleatorio ya existe; no se reutilizara ni eliminara.'}
    $owned=$true
    Invoke-Compose -Arguments @('config','--quiet')
    Invoke-Compose -Arguments @('build','db-init','verify')
    Invoke-Compose -Arguments @('up','--detach','--wait','--wait-timeout','210','sqlserver')
    $firstContainer=Get-SqlContainerId
    $firstVolume=Get-SqlVolume $firstContainer
    Invoke-Compose -Arguments @('run','--rm','--no-deps','db-init')
    Invoke-Compose -Arguments @('run','--rm','--no-deps','verify')
    Invoke-Compose -Arguments @('run','--rm','--no-deps','verify','--seed-persistence')

    Write-Output 'Recreando el contenedor SQL y conservando su volumen...'
    Invoke-Compose -Arguments @('rm','--stop','--force','sqlserver')
    Invoke-Compose -Arguments @('up','--detach','--wait','--wait-timeout','210','sqlserver')
    $secondContainer=Get-SqlContainerId
    $secondVolume=Get-SqlVolume $secondContainer
    if($firstContainer -eq $secondContainer -or $firstVolume -ne $secondVolume){throw 'No se verifico la recreacion con el mismo volumen.'}
    Invoke-Compose -Arguments @('run','--rm','--no-deps','db-init')
    Invoke-Compose -Arguments @('run','--rm','--no-deps','verify','--verify-persistence')
    if($VerifyBackend){
        $direccion=(Invoke-Compose -Arguments @('port','sqlserver','1433')|Out-String).Trim()
        if($direccion -notmatch '^127\.0\.0\.1:(\d+)$'){throw 'No se pudo obtener el puerto local de la prueba.'}
        $env:GF_API_TEST_CONNECTION_STRING="Server=127.0.0.1,$($Matches[1]);Database=$env:GF_DATABASE_NAME;User ID=$env:GF_APP_SQL_USER;Password=$env:GF_APP_SQL_PASSWORD;Encrypt=True;TrustServerCertificate=True;Connect Timeout=5"
        & (Join-Path (Split-Path $databaseRoot -Parent) 'scripts/Probar-Backend.ps1') -ConSql
    }
    $verification=Get-Content (Join-Path $artifactDirectory 'verification.json') -Raw|ConvertFrom-Json
    if($verification.Failed -ne 0 -or $verification.IntegrationTests -ne 89){throw 'Resultados SQL incompletos.'}
    [ordered]@{Project=$project;Database=$env:GF_DATABASE_NAME;IntegrationTests=89;Linux=$true;FreshInitialization=$true;ContainerRecreated=$true;SameNamedVolume=$true;AllRowsPreserved=$true;SequenceNotReset=$true;ReappliedDacpac=$true}|ConvertTo-Json|Set-Content (Join-Path $artifactDirectory 'docker-verification.json') -Encoding utf8
    Write-Output 'OK: inicializacion, 89 pruebas Linux, recreacion del contenedor y redespliegue conservando historia.'
}catch{
    if($owned){
        try{Invoke-Compose -Arguments @('logs','--no-color','--tail','160','sqlserver')|Out-File (Join-Path $artifactDirectory 'sqlserver-diagnostic.log') -Encoding utf8}catch{}
    }
    throw
}finally{
    try{
        if($owned){
            if($project -notmatch '^gf-db-test-[a-f0-9]{32}$'){throw 'Nombre de limpieza no permitido.'}
            Invoke-Compose -Arguments @('down','--volumes','--remove-orphans')
            $cleaned=$true
            [ordered]@{Project=$project;OwnedTemporaryVolumeRemoved=$cleaned}|ConvertTo-Json|Set-Content (Join-Path $artifactDirectory 'compose-cleanup.json') -Encoding utf8
        }
    }finally{
        foreach($key in $keys){[Environment]::SetEnvironmentVariable($key,$previousEnvironment[$key])}
    }
}
