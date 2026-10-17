[CmdletBinding()]
param(
    [ValidateSet('Build','Plan','Publish','Test')][string]$Action='Build',
    [string]$ConnectionStringEnvironment='GF_SQL_CONNECTION_STRING',
    [switch]$SkipBuild
)
$ErrorActionPreference='Stop'
$databaseRoot=Split-Path $PSScriptRoot -Parent
$project='GestorFertilizantes.Database/GestorFertilizantes.Database.sqlproj'
$testProject='tests/GestorFertilizantes.Database.Tests/GestorFertilizantes.Database.Tests.csproj'
$dacpac=Join-Path $databaseRoot 'GestorFertilizantes.Database/bin/Release/GestorFertilizantes.Database.dacpac'
$profile=Join-Path $databaseRoot 'Profiles/Portable.publish.xml'
$artifacts=Join-Path $databaseRoot 'artifacts'
$previousRollForward=$env:DOTNET_ROLL_FORWARD
$previousConnection=$env:GF_SQL_CONNECTION_STRING
function Invoke-DotNet([string[]]$Arguments){
    & dotnet @Arguments
    if($LASTEXITCODE -ne 0){throw 'Fallo una herramienta .NET de la base de datos. Revisar el diagnostico anterior.'}
}
Push-Location $databaseRoot
try{
    # SqlPackage targets net8; SDK net9 is the pinned toolchain for this project.
    $env:DOTNET_ROLL_FORWARD='Major'
    $env:DOTNET_CLI_TELEMETRY_OPTOUT='1'
    Invoke-DotNet -Arguments @('tool','restore')
    New-Item -ItemType Directory -Path $artifacts -Force | Out-Null
    if(-not $SkipBuild){
        Invoke-DotNet -Arguments @('restore',$project,'--locked-mode')
        Invoke-DotNet -Arguments @('build',$project,'--configuration','Release','--no-restore')
        Invoke-DotNet -Arguments @('restore',$testProject,'--locked-mode')
        Invoke-DotNet -Arguments @('build',$testProject,'--configuration','Release','--no-restore')
        $package=Join-Path $artifacts 'package'
        New-Item -ItemType Directory -Path $package -Force | Out-Null
        Get-ChildItem (Split-Path $dacpac -Parent) -Filter '*.dacpac' | Copy-Item -Destination $package -Force
        Copy-Item $profile (Join-Path $package 'Portable.publish.xml') -Force
        [xml]$projectDefinition=Get-Content $project -Raw
        $version=[Version]$projectDefinition.Project.PropertyGroup.DacVersion
        $releaseVersion='{0}.{1}.{2}' -f $version.Major,$version.Minor,$version.Build
        $manifest=[ordered]@{Version=$releaseVersion;DacVersion=$version.ToString();SqlServerMinimum='2022';DatabaseCollation='SQL_Latin1_General_CP1_CI_AS';BuildSql='2.3.0';SqlPackage='170.5.96';Sha256=(Get-FileHash $dacpac -Algorithm SHA256).Hash}
        $manifest|ConvertTo-Json|Set-Content (Join-Path $package 'manifest.json') -Encoding utf8
    }
    if(-not (Test-Path -LiteralPath $dacpac)){throw 'No existe el DACPAC. Ejecutar Build primero.'}
    if($Action -eq 'Build'){return}
    $connection=[Environment]::GetEnvironmentVariable($ConnectionStringEnvironment)
    if([string]::IsNullOrWhiteSpace($connection)){throw "Falta la variable de entorno $ConnectionStringEnvironment. No se selecciona una base implicitamente."}
    if($Action -eq 'Test'){
        $env:GF_SQL_CONNECTION_STRING=$connection
        Invoke-DotNet -Arguments @('run','--project',$testProject,'--configuration','Release','--no-build')
    }else{
        $common=@("/SourceFile:$dacpac","/TargetConnectionString:$connection","/Profile:$profile")
        # The plan is always generated before an explicit Publish action.
        $planFile=Join-Path $artifacts 'deploy.sql'
        $reportFile=Join-Path $artifacts 'deploy-report.xml'
        Invoke-DotNet -Arguments (@('tool','run','sqlpackage','/Action:Script')+$common+@("/DeployScriptPath:$planFile","/DeployReportPath:$reportFile"))
        if($Action -eq 'Publish'){
            Invoke-DotNet -Arguments (@('tool','run','sqlpackage','/Action:Publish')+$common)
        }
    }
}finally{
    $env:GF_SQL_CONNECTION_STRING=$previousConnection
    $env:DOTNET_ROLL_FORWARD=$previousRollForward
    Pop-Location
}
