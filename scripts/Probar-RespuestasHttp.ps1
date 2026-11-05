[CmdletBinding()]
param(
    [Parameter(Mandatory)][Net.Http.HttpClient]$Cliente,
    [Parameter(Mandatory)][string]$Direccion,
    [Parameter(Mandatory)][string]$RutaDocumentos,
    [Parameter(Mandatory)]$Solicitud,
    [Parameter(Mandatory)][long]$IdDestinatario,
    [Parameter(Mandatory)][long]$IdOtroDestinatario,
    [Parameter(Mandatory)][int]$IdPresentacionAlternativa
)

$ErrorActionPreference='Stop'
$connection=[Data.Common.DbConnectionStringBuilder]::new()
$connection.set_ConnectionString($env:GF_API_TEST_CONNECTION_STRING)
$database=$null
if(-not $connection.TryGetValue('Database',[ref]$database)){
    $null=$connection.TryGetValue('Initial Catalog',[ref]$database)
}
if($database -cnotmatch '^GF_DB_COMPOSE_[a-f0-9]{32}$'){throw 'Respuestas HTTP solo admite la base temporal propia de Compose.'}
$checks=[Collections.Generic.List[object]]::new()

function Assert-Respuesta([bool]$Condicion,[string]$Caso){
    if(-not $Condicion){throw $Caso}
    $checks.Add([ordered]@{Caso=$Caso;Estado='Aprobado'})
}

function Invoke-Respuesta([string]$Metodo,[string]$Ruta,[int]$Estado,$Datos=$null,[byte[]]$Pdf=$null,[string]$Nombre='Respuesta.pdf'){
    $request=[Net.Http.HttpRequestMessage]::new([Net.Http.HttpMethod]::new($Metodo),"$Direccion/api/$Ruta")
    $response=$null
    try{
        if($null -ne $Pdf){
            $request.Content=[Net.Http.MultipartFormDataContent]::new()
            $contenido=[Net.Http.ByteArrayContent]::new($Pdf)
            $contenido.Headers.ContentType=[Net.Http.Headers.MediaTypeHeaderValue]::new('application/pdf')
            $request.Content.Add($contenido,'archivo',$Nombre)
        }elseif($null -ne $Datos){
            $request.Content=[Net.Http.StringContent]::new(($Datos | ConvertTo-Json -Depth 10 -Compress),[Text.Encoding]::UTF8,'application/json')
        }
        $response=$Cliente.SendAsync($request).GetAwaiter().GetResult()
        $body=$response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json
        Assert-Respuesta ([int]$response.StatusCode -eq $Estado -and $body.exito -eq ($Estado -lt 400)) "$Metodo $Ruta devuelve $Estado (obtenido $([int]$response.StatusCode))."
        if($Estado -eq 201 -and -not $response.Headers.Location){throw 'La nueva respuesta no devuelve Location.'}
        return $body.data
    }finally{if($response){$response.Dispose()};$request.Dispose()}
}

function Get-BytesRespuesta([string]$Ruta){
    $response=$Cliente.GetAsync("$Direccion/api/$Ruta").GetAwaiter().GetResult()
    try{
        if([int]$response.StatusCode -ne 200 -or $response.Content.Headers.ContentType.MediaType -ne 'application/pdf'){
            throw "No se descargó el PDF de $Ruta."
        }
        return ,($response.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult())
    }finally{$response.Dispose()}
}

function New-PdfExterno {
    $objetos=@(
        '<< /Type /Catalog /Pages 2 0 R >>'
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>'
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> >>'
    )
    $pdf=[Text.StringBuilder]::new("%PDF-1.4`n")
    $offsets=@()
    for($i=0;$i -lt $objetos.Count;$i++){
        $offsets += $pdf.Length
        [void]$pdf.Append("$($i+1) 0 obj`n$($objetos[$i])`nendobj`n")
    }
    $xref=$pdf.Length
    [void]$pdf.Append("xref`n0 4`n0000000000 65535 f `n")
    foreach($offset in $offsets){[void]$pdf.Append(("{0:D10} 00000 n `n" -f $offset))}
    [void]$pdf.Append("trailer`n<< /Size 4 /Root 1 0 R >>`nstartxref`n$xref`n%%EOF`n")
    return ,([Text.Encoding]::ASCII.GetBytes($pdf.ToString()))
}

$id=$Solicitud.idSolicitudCotizacion
$rutaSolicitud="solicitudes-cotizacion/$id"
$comparacion="$rutaSolicitud/comparacion"
$criterio='moneda=CRC&baseTotalLinea=Bruto&fechaReferencia=2026-04-08'
$dest="$rutaSolicitud/destinatarios/$IdDestinatario"
$otro="$rutaSolicitud/destinatarios/$IdOtroDestinatario"
$pdf=Get-BytesRespuesta "$dest/documento"
$hash=[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($pdf))
$null=Invoke-Respuesta POST "$otro/respuestas" 409 -Pdf $pdf
$null=Invoke-Respuesta POST "$dest/respuestas" 400 -Pdf ([Text.Encoding]::ASCII.GetBytes('%PDF-1.7 archivo roto'))
$recibida=Invoke-Respuesta POST "$dest/respuestas" 201 -Pdf $pdf -Nombre 'Formulario-devuelto.pdf'
$ruta="respuestas-cotizacion/$($recibida.respuesta.idProformaProveedor)"
$linea=$recibida.lineas[0].idProformaProveedorDetalle
$detalle=$Solicitud.lineas[0].idSolicitudCotizacionDetalle
$detalleLiquido=$Solicitud.lineas[1].idSolicitudCotizacionDetalle
$lineaLiquida=@($recibida.lineas | Where-Object idSolicitudDetalle -eq $detalleLiquido)[0].idProformaProveedorDetalle
Assert-Respuesta ($recibida.respuesta.estado -ceq 'Borrador' -and $recibida.importacion.metodo -ceq 'AcroForm' -and
    $recibida.importacion.estado -ceq 'Parcial' -and $recibida.documento.sha256 -ceq $hash -and
    $recibida.lineas[0].idSolicitudDetalle -eq $detalle -and $null -eq $recibida.lineas[0].precioUnitario -and
    $recibida.lineas[0].estadoRevision -ceq 'Pendiente') 'El formulario reconocido queda pendiente y no inventa precios'
$null=Invoke-Respuesta POST "$dest/respuestas" 409 -Pdf $pdf
Assert-Respuesta (@(Get-ChildItem -LiteralPath $RutaDocumentos -Recurse -File -Filter '*.pdf').Count -eq 3) 'Rechazos y segundo borrador no dejan archivos adicionales'
$contexto=Invoke-Respuesta GET $rutaSolicitud 200
$a=@($contexto.destinatarios | Where-Object idSolicitudCotizacionProveedor -eq $IdDestinatario)[0]
Assert-Respuesta ($a.estado -ceq 'Respondida' -and $null -ne $a.fechaEnvio -and $null -ne $a.fechaRespuesta) 'Una respuesta actualiza al destinatario con envío previamente registrado'

$externo=New-PdfExterno
$manual=Invoke-Respuesta POST "$otro/respuestas" 201 -Pdf $externo -Nombre 'Proforma-propia.pdf'
$rutaManual="respuestas-cotizacion/$($manual.respuesta.idProformaProveedor)"
$lineaManual=@($manual.lineas | Where-Object idSolicitudDetalle -eq $detalle)[0].idProformaProveedorDetalle
$liquidaManual=@($manual.lineas | Where-Object idSolicitudDetalle -eq $detalleLiquido)[0].idProformaProveedorDetalle
$manualHash=[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($externo))
Assert-Respuesta ($manual.importacion.metodo -ceq 'Manual' -and $manual.importacion.estado -ceq 'NoCompatible' -and
    $manual.documento.sha256 -ceq $manualHash -and $null -eq $manual.lineas[0].numeroLinea -and
    $null -eq $manual.cabecera.total) 'Un formato externo conserva el archivo y deja la captura vacía'
$contexto=Invoke-Respuesta GET $rutaSolicitud 200
$a=@($contexto.destinatarios | Where-Object idSolicitudCotizacionProveedor -eq $IdOtroDestinatario)[0]
Assert-Respuesta ($null -eq $a.fechaEnvio -and $a.cantidadRespuestas -eq 1) 'Una respuesta recibida no inventa evidencia de envío'
$null=Invoke-Respuesta POST "$ruta/lineas/$lineaManual/revision" 404 @{motivo='Línea de otro proveedor'}
$null=Invoke-Respuesta POST "$rutaManual/lineas" 200 @{motivo='El proveedor indicó otro producto sin existencias';linea=@{tipoOferta='Adicional';estadoOferta='NoDisponible';descripcion='Producto adicional';numeroLinea=3}}
$null=Invoke-Respuesta POST "$ruta/validacion" 409
$vacia=Invoke-Respuesta GET "$comparacion`?$criterio" 200
Assert-Respuesta (@($vacia.lineas).Count -eq 2 -and @($vacia.documentos).Count -eq 0 -and
    @($vacia.lineas.ofertas | Where-Object condicionComparacion -ceq 'SinRespuestaValidada').Count -eq 4 -and
    @($vacia.lineas.ofertas | Where-Object {$null -ne $_.precioPorUnidadBase}).Count -eq 0) 'La comparación muestra los proveedores y no toma precios de borradores'

$ajuste=@{motivo='Captura revisada contra el PDF';linea=@{
    idSolicitudDetalle=$detalle;numeroLinea=1;codigo='001-1728';descripcion='Saco revisado';tipoOferta='Solicitada';
    estadoOferta='Cotizada';baseTotalLinea='Bruto';cantidadEmpaques=2;precioUnitario=100;totalLinea=200
}}
$imprecisa=$ajuste.linea.Clone(); $imprecisa.precioUnitario='100.0000001'
$null=Invoke-Respuesta PUT "$ruta/lineas/$linea" 400 @{motivo='No se debe redondear';linea=$imprecisa}
$null=Invoke-Respuesta PUT "$ruta/lineas/$linea" 200 $ajuste
$ajusteLiquido=@{motivo='Captura de oferta líquida';linea=@{
    idSolicitudDetalle=$detalleLiquido;numeroLinea=2;descripcion='Bidón de 20 litros';tipoOferta='Solicitada';
    estadoOferta='Cotizada';baseTotalLinea='Bruto';cantidadEmpaques=2;precioUnitario=20;totalLinea=40
}}
$null=Invoke-Respuesta PUT "$ruta/lineas/$lineaLiquida" 200 $ajusteLiquido
$cabecera=@{motivo='Datos transcritos y revisados';cabecera=@{
    numeroProforma='EXT-1';fechaProforma='2026-04-01';fechaVencimiento='2026-04-08';moneda='CRC';subtotal=240;descuento=10;iva=5;
    otrosCargos=0;total=235;datosClienteOriginal=@{nombre='Finca de prueba'};datosProveedorOriginal=@{nombre='Proveedor de prueba'}
}}
$null=Invoke-Respuesta PUT "$ruta/cabecera" 200 $cabecera
$conciliacion=@{estadoConciliacion='Conciliada';motivo='Verifiqué el total del documento';tolerancia=0}
$null=Invoke-Respuesta POST "$ruta/lineas/$linea/revision" 200 @{motivo='Confirmé la línea con el PDF'}
$null=Invoke-Respuesta POST "$ruta/lineas/$lineaLiquida/revision" 200 @{motivo='Confirmé el bidón y el precio por empaque'}
$null=Invoke-Respuesta POST "$ruta/conciliacion" 200 $conciliacion
$ajuste.linea.observacion='Comprobado nuevamente';$ajuste.motivo='Se revisó de nuevo el detalle'
$corregida=Invoke-Respuesta PUT "$ruta/lineas/$linea" 200 $ajuste
$valor=@($corregida.importacion.camposOriginales | Where-Object nombre -ceq "linea_${detalle}_precioUnitario")[0]
Assert-Respuesta ($corregida.respuesta.estadoConciliacion -ceq 'Pendiente' -and $corregida.lineas[0].estadoRevision -ceq 'Pendiente' -and
    $corregida.importacion.idImportacionDocumento -eq $recibida.importacion.idImportacionDocumento -and $valor.valor -ceq '' -and
    @($corregida.historial | Where-Object motivo -ceq $ajuste.motivo).Count -ge 1) 'El ajuste reinicia la revisión y conciliación y conserva extracción e historial'
$null=Invoke-Respuesta POST "$ruta/validacion" 409
$null=Invoke-Respuesta POST "$ruta/lineas/$linea/revision" 200 @{motivo='Confirmé la corrección'}
$null=Invoke-Respuesta POST "$ruta/conciliacion" 200 $conciliacion
$validada=Invoke-Respuesta POST "$ruta/validacion" 200
Assert-Respuesta ($validada.respuesta.estado -ceq 'Validada' -and
    [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData((Get-BytesRespuesta "$ruta/documento"))) -ceq $hash -and
    [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData((Get-BytesRespuesta "$rutaManual/documento"))) -ceq $manualHash) 'Validar y corregir conservan los bytes de los dos PDF'
$null=Invoke-Respuesta PUT "$ruta/cabecera" 409 $cabecera
$revision=Invoke-Respuesta POST "$ruta/revisiones" 201
Assert-Respuesta ($revision.respuesta.estado -ceq 'Borrador' -and $revision.respuesta.versionRespuesta -eq 2 -and
    $revision.documento.idDocumento -eq $recibida.documento.idDocumento -and $revision.importacion.idImportacionDocumento -eq $recibida.importacion.idImportacionDocumento) 'Revisar una respuesta validada conserva sus fuentes originales'

$comparada=Invoke-Respuesta GET "$comparacion`?$criterio" 200
$doc=$comparada.documentos[0]
$peso=$comparada.lineas[0];$volumen=$comparada.lineas[1]
Assert-Respuesta (@($comparada.documentos).Count -eq 1 -and $doc.idProformaProveedor -eq $validada.respuesta.idProformaProveedor -and
    $doc.ajustesGlobales.descuento -eq 10 -and $doc.ajustesGlobales.iva -eq 5 -and $doc.ajustesGlobales.otrosCargos -eq 0 -and
    $doc.totalDocumento -eq 235 -and $null -eq $peso.ofertas[0].ajustesGlobales) 'La revisión pendiente no sustituye a la validada y el documento aparece una vez'
Assert-Respuesta ($peso.unidadBase -ceq 'KG' -and $peso.contenidoTotalSolicitado -eq 81.25 -and
    $peso.ofertas[0].precioPorUnidadBase -eq 4 -and $peso.ofertas[0].precioPorEmpaque -eq 100 -and
    $peso.ofertas[0].esMenorPrecioUnitario -and -not $peso.ofertas[0].cubreCantidadSolicitada -and
    $null -eq $peso.menorPrecioConCoberturaYVigencia) 'El costo por kg usa el total de línea y señala una oferta parcial'
Assert-Respuesta ($volumen.unidadBase -ceq 'L' -and $volumen.menorPrecioConCoberturaYVigencia -eq 1 -and
    $volumen.ofertas[0].vigente -eq $true -and $volumen.ofertas[0].esMenorPrecioConCoberturaYVigencia) 'El costo por litro se calcula aparte y el vencimiento es inclusivo'

$null=Invoke-Respuesta PUT "$rutaManual/lineas/$lineaManual" 200 @{motivo='El proveedor ofrece otra presentación';linea=@{
    idSolicitudDetalle=$detalle;numeroLinea=1;descripcion='Bolsa de 10 kg';tipoOferta='Alternativa';motivoAlternativa='Otra presentación del mismo producto';
    idPresentacionProducto=$IdPresentacionAlternativa;estadoOferta='Cotizada';baseTotalLinea='Bruto';cantidadEmpaques=9;precioUnitario=30;totalLinea=270
}}
$manualCorregida=Invoke-Respuesta PUT "$rutaManual/lineas/$liquidaManual" 200 @{motivo='Confirmé que no hay bidones';linea=@{
    idSolicitudDetalle=$detalleLiquido;numeroLinea=2;tipoOferta='Solicitada';estadoOferta='NoDisponible'
}}
$cabeceraAlternativa=$cabecera.cabecera.Clone()
$cabeceraAlternativa.numeroProforma='EXT-2'
$cabeceraAlternativa.subtotal=270
$cabeceraAlternativa.descuento=0
$cabeceraAlternativa.iva=0
$cabeceraAlternativa.otrosCargos=20
$cabeceraAlternativa.total=290
$null=Invoke-Respuesta PUT "$rutaManual/cabecera" 200 @{motivo='Transcripción de segunda proforma';cabecera=$cabeceraAlternativa}
foreach($l in $manualCorregida.lineas){
    $null=Invoke-Respuesta POST "$rutaManual/lineas/$($l.idProformaProveedorDetalle)/revision" 200 @{motivo='Confirmé el renglón del segundo proveedor'}
}
$null=Invoke-Respuesta POST "$rutaManual/conciliacion" 200 $conciliacion
$manualValidada=Invoke-Respuesta POST "$rutaManual/validacion" 200
$ambas=Invoke-Respuesta GET "$comparacion`?$criterio" 200
$ganadora=$ambas.lineas[0].ofertas[0]
$sinBidon=@($ambas.lineas[1].ofertas | Where-Object idSolicitudCotizacionProveedor -eq $IdOtroDestinatario)[0]
Assert-Respuesta (@($ambas.documentos).Count -eq 2 -and @($ambas.lineas).Count -eq 2 -and
    $ganadora.idProformaProveedor -eq $manualValidada.respuesta.idProformaProveedor -and $ganadora.precioPorUnidadBase -eq 3 -and
    $ganadora.contenidoTotalOfrecido -eq 90 -and $ganadora.esMenorPrecioConCoberturaYVigencia -and $sinBidon.condicionComparacion -ceq 'NoDisponible' -and
    $null -eq $sinBidon.precioPorUnidadBase) 'Compara empaques distintos por kg y conserva las ofertas no disponibles'

$sinAlternativas=Invoke-Respuesta GET "$comparacion`?$criterio&incluirAlternativas=false&tipoBase=PESO&idSolicitudCotizacionDetalle=$detalle" 200
Assert-Respuesta (@($sinAlternativas.lineas).Count -eq 1 -and -not $sinAlternativas.criterio.incluirAlternativas -and
    $sinAlternativas.lineas[0].menorPrecioPorUnidadBase -eq 4 -and
    $sinAlternativas.lineas[0].ofertas[1].condicionComparacion -ceq 'AlternativaNoIncluida') 'Los filtros de renglón, dimensión y alternativas llegan a SQL'
$distinta=Invoke-Respuesta GET "$comparacion`?moneda=USD&baseTotalLinea=Bruto&fechaReferencia=2026-04-08" 200
$baseDistinta=Invoke-Respuesta GET "$comparacion`?moneda=CRC&baseTotalLinea=ConImpuestos&fechaReferencia=2026-04-08" 200
$vencida=Invoke-Respuesta GET "$comparacion`?moneda=CRC&baseTotalLinea=Bruto&fechaReferencia=2026-04-09" 200
Assert-Respuesta ($distinta.lineas[0].ofertas[0].condicionComparacion -ceq 'MonedaDistinta' -and
    $baseDistinta.lineas[0].ofertas[0].condicionComparacion -ceq 'BasePrecioDistinta' -and
    $null -eq $distinta.lineas[0].menorPrecioPorUnidadBase -and $null -eq $baseDistinta.lineas[0].menorPrecioPorUnidadBase -and
    $vencida.lineas[0].menorPrecioPorUnidadBase -eq 3 -and $null -eq $vencida.lineas[0].menorPrecioConCoberturaYVigencia) 'No mezcla monedas o bases ni marca una oferta vencida como vigente'

$null=Invoke-Respuesta GET $comparacion 400
$null=Invoke-Respuesta GET "$comparacion`?moneda=crc&baseTotalLinea=Bruto&fechaReferencia=2026-04-08" 400
$null=Invoke-Respuesta GET "$comparacion`?moneda=CRC&baseTotalLinea=SinDefinir&fechaReferencia=2026-04-08" 400
$null=Invoke-Respuesta GET "$comparacion`?moneda=CRC&baseTotalLinea=Bruto&fechaReferencia=2026-02-30" 400
$null=Invoke-Respuesta GET "$comparacion`?$criterio&tipoBase=litros" 400
$null=Invoke-Respuesta GET "$comparacion`?$criterio&idSolicitudCotizacionDetalle=9223372036854775807" 400
$null=Invoke-Respuesta GET "solicitudes-cotizacion/9223372036854775807/comparacion`?$criterio" 404

$null=Invoke-Respuesta POST "respuestas-cotizacion/$($revision.respuesta.idProformaProveedor)/cancelacion" 200 @{motivo='Prueba de cancelación'}
$lista=Invoke-Respuesta GET "$dest/respuestas" 200
Assert-Respuesta ($lista.totalRegistros -eq 2 -and @($lista.elementos).Count -eq 2) 'Listado del destinatario incluye sus dos versiones y excluye al otro proveedor'

$checks
