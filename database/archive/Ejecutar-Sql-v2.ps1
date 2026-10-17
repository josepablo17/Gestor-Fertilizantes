param(
    [Parameter(Mandatory=$true)][string[]]$Script,
    [switch]$Atomic,
    [switch]$Rollback,
    [string]$ResultFile,
    [int]$TimeoutSeconds=120
)
$ErrorActionPreference='Stop'
if($Rollback -and -not $Atomic){throw 'Rollback requiere Atomic.'}
$sqlText=($Script|ForEach-Object{Get-Content -LiteralPath $_ -Raw -Encoding utf8}) -join "`r`nGO`r`n"
$connection=New-Object System.Data.SqlClient.SqlConnection
$connection.ConnectionString='Server=localhost;Database=BDComprasFertilizantes;Integrated Security=True;Encrypt=True;TrustServerCertificate=True;Connect Timeout=10;Application Name=GestorFertilizantesSchemaMigration'
$transaction=$null
$rows=@()
try {
    $connection.Open()
    if($Atomic){$transaction=$connection.BeginTransaction()}
    $batches=[regex]::Split($sqlText,'(?im)^\s*GO\s*(?:--[^\r\n]*)?\r?$')
    foreach($batch in $batches){
        if([string]::IsNullOrWhiteSpace($batch)){continue}
        $command=$connection.CreateCommand()
        $command.CommandTimeout=$TimeoutSeconds
        $command.CommandText=$batch
        if($transaction){$command.Transaction=$transaction}
        $reader=$command.ExecuteReader()
        do{
            while($reader.Read()){
                $row=[ordered]@{}
                for($i=0;$i -lt $reader.FieldCount;$i++){
                    $row[$reader.GetName($i)]=if($reader.IsDBNull($i)){$null}else{$reader.GetValue($i)}
                }
                $rows += [pscustomobject]$row
            }
        }while($reader.NextResult())
        $reader.Dispose()
        $command.Dispose()
    }
    if($transaction){if($Rollback){$transaction.Rollback()}else{$transaction.Commit()}}
    if($ResultFile){$rows|ConvertTo-Json -Depth 20|Set-Content -LiteralPath $ResultFile -Encoding utf8}
    $rows|ConvertTo-Json -Depth 20 -Compress
}catch{
    if($transaction){try{$transaction.Rollback()}catch{}}
    throw
}finally{
    if($transaction){$transaction.Dispose()}
    $connection.Dispose()
}
