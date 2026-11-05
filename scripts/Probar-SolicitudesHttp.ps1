[CmdletBinding()]
param(
    [Parameter(Mandatory)][Net.Http.HttpClient]$Cliente,
    [Parameter(Mandatory)][string]$Direccion,
    [Parameter(Mandatory)][string]$RutaDocumentos
)

$ErrorActionPreference='Stop'
$connection=[Data.Common.DbConnectionStringBuilder]::new()
$connection.set_ConnectionString($env:GF_API_TEST_CONNECTION_STRING)
$database=$null
if(-not $connection.TryGetValue('Database',[ref]$database)){
    $null=$connection.TryGetValue('Initial Catalog',[ref]$database)
}
if($database -cnotmatch '^GF_DB_COMPOSE_[a-f0-9]{32}$'){throw 'Solicitudes HTTP solo admite la base temporal propia de Compose.'}
$checks=[Collections.Generic.List[object]]::new()

function Assert-Solicitud([bool]$Condicion,[string]$Caso){
    if(-not $Condicion){throw $Caso}
    $checks.Add([ordered]@{Caso=$Caso;Estado='Aprobado'})
}

function Invoke-Solicitud([string]$Metodo,[string]$Ruta,[int]$Estado,$Datos=$null){
    $request=[Net.Http.HttpRequestMessage]::new([Net.Http.HttpMethod]::new($Metodo),"$Direccion/api/$Ruta")
    $response=$null
    try{
        if($null -ne $Datos){$request.Content=[Net.Http.StringContent]::new(($Datos | ConvertTo-Json -Depth 10 -Compress),[Text.Encoding]::UTF8,'application/json')}
        $response=$Cliente.SendAsync($request).GetAwaiter().GetResult()
        $body=$response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json
        Assert-Solicitud ([int]$response.StatusCode -eq $Estado -and $body.exito -eq ($Estado -lt 400)) "$Metodo $Ruta devuelve $Estado (obtenido $([int]$response.StatusCode))."
        if($Estado -eq 201 -and -not $response.Headers.Location){throw 'La solicitud o alta de prueba no devuelve Location.'}
        return $body.data
    }finally{if($response){$response.Dispose()};$request.Dispose()}
}

function Get-PdfSolicitud([string]$Ruta){
    $response=$Cliente.GetAsync("$Direccion/api/$Ruta").GetAwaiter().GetResult()
    try{
        $bytes=$response.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult()
        Assert-Solicitud ([int]$response.StatusCode -eq 200 -and $response.Content.Headers.ContentType.MediaType -eq 'application/pdf' -and
            $response.Content.Headers.ContentDisposition.DispositionType -eq 'attachment' -and $bytes.Length -gt 5 -and
            [Text.Encoding]::ASCII.GetString($bytes,0,5) -ceq '%PDF-') 'La descarga entrega un PDF como adjunto'
        return [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes))
    }finally{$response.Dispose()}
}

$suffix=[guid]::NewGuid().ToString('N')
$idBase=(Invoke-Solicitud POST 'ProductoBase/InsertarProductoBase' 201 @{codigo="S-$suffix";nombre="Base $suffix"}).idProductoBase
$producto=@{nombre="Producto original $suffix";idProductoBase=$idBase}
$idProducto=(Invoke-Solicitud POST 'Producto/InsertarProducto' 201 $producto).idProducto
$kg=@((Invoke-Solicitud GET 'UnidadMedida/ListarUnidadMedida' 200) | Where-Object {$_.codigo -ceq 'KG'})[0].idUnidadMedida
$idPresentacion=(Invoke-Solicitud POST 'PresentacionProducto/InsertarPresentacionProducto' 201 @{idProducto=$idProducto;descripcion='Saco';cantidad=25;idUnidadMedida=$kg}).idPresentacionProducto
$idProveedor1=(Invoke-Solicitud POST 'Proveedor/InsertarProveedor' 201 @{nombre="Proveedor A $suffix"}).idProveedor
$idProveedor2=(Invoke-Solicitud POST 'Proveedor/InsertarProveedor' 201 @{nombre="Proveedor B $suffix"}).idProveedor

$ruta='solicitudes-cotizacion'
$numero="SOL-$suffix"
$borrador=Invoke-Solicitud POST $ruta 201 @{numeroSolicitud=$numero;fechaSolicitud='2026-03-26'}
$id=$borrador.idSolicitudCotizacion
$null=Invoke-Solicitud POST "$ruta/$id/emision" 400
$linea=@{numeroLinea=1;idProducto=$idProducto;idPresentacionProducto=$idPresentacion;cantidadEmpaques=3.25;permiteAlternativas=$false}
$datos=@{numeroSolicitud=$numero;fechaSolicitud='2026-03-26';fechaLimiteRespuesta='2026-04-03';datosCliente=@{nombre=' Finca de prueba '};lineas=@($linea);proveedores=@($idProveedor1,$idProveedor2)}
$invalida=$datos.Clone(); $invalida.lineas=@($null)
$null=Invoke-Solicitud PUT "$ruta/$id/borrador" 400 $invalida
$invalida.lineas=@($linea.Clone()); $invalida.lineas[0].cantidadEmpaques=1.00001
$null=Invoke-Solicitud PUT "$ruta/$id/borrador" 400 $invalida
$invalida.lineas=@($linea.Clone()); $invalida.lineas[0].nombreProductoOriginal='Manipulado'
$null=Invoke-Solicitud PUT "$ruta/$id/borrador" 400 $invalida
$invalida.lineas=@($linea)*101
$null=Invoke-Solicitud PUT "$ruta/$id/borrador" 400 $invalida
$invalida=$datos.Clone(); $invalida.proveedores=@($idProveedor1,$idProveedor1)
$null=Invoke-Solicitud PUT "$ruta/$id/borrador" 409 $invalida
$primera=Invoke-Solicitud PUT "$ruta/$id/borrador" 200 $datos
$segunda=Invoke-Solicitud PUT "$ruta/$id/borrador" 200 $datos
$destino1=$segunda.destinatarios[0].idSolicitudCotizacionProveedor
$destino2=$segunda.destinatarios[1].idSolicitudCotizacionProveedor
Assert-Solicitud ($segunda.lineas[0].idSolicitudCotizacionDetalle -ne $primera.lineas[0].idSolicitudCotizacionDetalle -and
    $destino1 -ne $primera.destinatarios[0].idSolicitudCotizacionProveedor -and $segunda.datosCliente.nombre -ceq 'Finca de prueba' -and
    $segunda.lineas[0].cantidadEmpaquesSolicitada -eq 3.25 -and $segunda.lineas[0].contenidoNormalizadoOriginal -eq 25) 'El borrador se reemplaza y captura la presentación desde SQL'

$rutaDest="$ruta/$id/destinatarios/$destino1"
$rutaPdf="$rutaDest/documento"
$null=Invoke-Solicitud POST $rutaPdf 409
$emitida=Invoke-Solicitud POST "$ruta/$id/emision" 200
Assert-Solicitud ($emitida.estado -ceq 'Emitida' -and $emitida.lineas[0].idSolicitudCotizacionDetalle -eq $segunda.lineas[0].idSolicitudCotizacionDetalle) 'La emisión conserva los renglones'
$null=Invoke-Solicitud PUT "$ruta/$id/borrador" 409 $datos
$null=Invoke-Solicitud POST "$ruta/$id/destinatarios/$($primera.destinatarios[0].idSolicitudCotizacionProveedor)/documento" 404
$null=Invoke-Solicitud GET $rutaPdf 404
$null=Invoke-Solicitud POST "$rutaDest/envios" 409 @{}

# Iniciar dos peticiones antes de esperar: ambas deben recibir el mismo original.
$pendientes=@(
    $Cliente.PostAsync("$Direccion/api/$rutaPdf",$null)
    $Cliente.PostAsync("$Direccion/api/$rutaPdf",$null)
)
$documentos=@(foreach($pendiente in $pendientes){
    $response=$pendiente.GetAwaiter().GetResult()
    try{
        if([int]$response.StatusCode -ne 200){throw "Generación simultánea devolvió $([int]$response.StatusCode)."}
        ($response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json).data
    }finally{$response.Dispose()}
})
$doc=$documentos[0]
Assert-Solicitud ($doc.idDocumento -gt 0 -and $doc.idDocumento -eq $documentos[1].idDocumento -and
    $doc.sha256 -ceq $documentos[1].sha256 -and $doc.versionPlantilla -ceq 'GF-SOL-1' -and
    $doc.tamanoBytes -gt 0 -and $null -eq $doc.rutaAlmacenamiento -and
    @(Get-ChildItem -LiteralPath $RutaDocumentos -Recurse -File -Filter '*.pdf').Count -eq 1) 'Las generaciones simultáneas conservan un original y su huella'
Assert-Solicitud ((Get-PdfSolicitud $rutaPdf) -ceq $doc.sha256) 'Los bytes descargados coinciden con SHA-256'
$pendiente=(Invoke-Solicitud GET "$ruta/$id" 200).destinatarios[0]
Assert-Solicitud ($pendiente.estado -ceq 'PendienteEnvio' -and $null -eq $pendiente.fechaEnvio -and $pendiente.idDocumentoGenerado -eq $doc.idDocumento) 'Generar y descargar no registran un envío'

$producto.idProducto=$idProducto
$producto.nombre="Producto revisado $suffix"
$null=Invoke-Solicitud PUT 'Producto/ActualizarProducto' 200 $producto
$original=Invoke-Solicitud POST $rutaPdf 200
$otraRuta="$ruta/$id/destinatarios/$destino2/documento"
$otro=Invoke-Solicitud POST $otraRuta 200
Assert-Solicitud ($original.idDocumento -eq $doc.idDocumento -and $original.sha256 -ceq $doc.sha256 -and
    $otro.idDocumento -ne $doc.idDocumento -and $otro.sha256 -cne $doc.sha256 -and
    (Invoke-Solicitud GET "$ruta/$id" 200).lineas[0].nombreProductoOriginal -ceq "Producto original $suffix") 'El catálogo revisado no altera la solicitud ni el PDF anterior; otro proveedor obtiene su propio PDF'
$null=Invoke-Solicitud POST "$rutaDest/envios" 400 @{fechaEnvio='2000-01-01T00:00:00Z'}
$enviada=(Invoke-Solicitud POST "$rutaDest/envios" 200 @{}).destinatarios[0]
$reintento=(Invoke-Solicitud POST "$rutaDest/envios" 200 @{}).destinatarios[0]
Assert-Solicitud ($enviada.estado -ceq 'Enviada' -and $null -ne $enviada.fechaEnvio -and
    $reintento.fechaEnvio -eq $enviada.fechaEnvio -and $reintento.idDocumentoGenerado -eq $doc.idDocumento) 'El registro de envío conserva su primera fecha y su PDF'

$pagina=Invoke-Solicitud GET "$ruta`?buscar=$numero&estado=Emitida&pagina=1&tamanoPagina=1" 200
Assert-Solicitud ($pagina.totalRegistros -eq 1 -and $pagina.elementos[0].idSolicitudCotizacion -eq $id) 'El listado filtra por estado y número'
$revision=Invoke-Solicitud POST "$ruta/$id/revisiones" 201
Assert-Solicitud ($revision.estado -ceq 'Borrador' -and $revision.versionSolicitud -eq 2 -and $revision.idSolicitudAnterior -eq $id -and
    $revision.lineas[0].idSolicitudCotizacionDetalle -ne $emitida.lineas[0].idSolicitudCotizacionDetalle -and
    $revision.destinatarios[0].idSolicitudCotizacionProveedor -ne $destino1 -and $null -eq $revision.destinatarios[0].idDocumentoGenerado) 'La revisión crea identidades nuevas sin heredar documentos ni envíos'
$null=Invoke-Solicitud GET "$ruta/$($revision.idSolicitudCotizacion)/destinatarios/$destino1/documento" 404
$cerrada=Invoke-Solicitud PUT "$ruta/$id/estado" 200 @{estado='Cerrada'}
Assert-Solicitud ($cerrada.estado -ceq 'Cerrada' -and (Get-PdfSolicitud $rutaPdf) -ceq $doc.sha256) 'Al cerrar se conserva la descarga del original'

$checks
