param([string]$FixturePath=(Join-Path $PSScriptRoot 'fixture-pruebas.sql'),[switch]$Candidate)
$ErrorActionPreference='Stop'
$fixture=Get-Content -LiteralPath $FixturePath -Raw -Encoding utf8
$validar="UPDATE dbo.ProformasProveedorDetalle SET EstadoRevision='Revisada' WHERE IdProformaProveedor=@Q; UPDATE dbo.ProformasProveedor SET EstadoConciliacion='Conciliada' WHERE IdProformaProveedor=@Q; EXEC dbo.usp_Proforma_Validar @Q;"
$cases=@(
 @{Name='Flujo completo y precio normalizado';Setup=$validar;Sql="IF (SELECT COUNT(*) FROM dbo.vw_OfertasValidadasVigentes WHERE IdProformaProveedor=@Q)<>1 THROW 51901,N'Falta oferta',1; IF NOT EXISTS(SELECT 1 FROM dbo.vw_OfertasValidadasVigentes WHERE IdProformaProveedor=@Q AND ABS(PrecioDocumentoPorUnidadBase-100/@Normalizada)<0.000001 AND ContenidoTotalNormalizado=2*@Normalizada) THROW 51901,N'Precio o contenido incorrectos',1;"},
 @{Name='Mismo nombre de producto con otra marca';Sql="DECLARE @OtraMarca int=(SELECT TOP(1) IdMarca FROM dbo.Marcas WHERE IdMarca<>(SELECT IdMarca FROM dbo.Productos WHERE IdProducto=@P)); INSERT dbo.Productos(Nombre,IdProductoBase,IdMarca) SELECT @Nombre,IdProductoBase,@OtraMarca FROM dbo.Productos WHERE IdProducto=@P; IF NOT EXISTS(SELECT 1 FROM dbo.Productos p JOIN dbo.Marcas m ON m.IdMarca=p.IdMarca WHERE p.Nombre=@Nombre AND p.IdMarca=@OtraMarca AND p.Marca=m.Nombre) THROW 51901,N'No admite otra marca',1;"},
 @{Name='Nombre vacio rechazado';Sql="UPDATE dbo.Productos SET Nombre=N'   ' WHERE IdProducto=@P;";Errors=@(547)},
 @{Name='Marca duplicada normalizada rechazada';Sql="INSERT dbo.Marcas(Nombre)SELECT N' '+LOWER(Nombre)+N' ' FROM dbo.Marcas WHERE IdMarca=(SELECT MIN(IdMarca) FROM dbo.Marcas);";Errors=@(2601,2627)},
 @{Name='Linea de otra solicitud rechazada';Sql="UPDATE dbo.ProformasProveedorDetalle SET IdSolicitudCotizacionDetalle=@D2 WHERE IdProformaProveedorDetalle=@QD;";Errors=@(547)},
 @{Name='Proveedor ajeno al destinatario rechazado';Sql="UPDATE dbo.ProformasProveedor SET IdProveedor=@OtroProveedor WHERE IdProformaProveedor=@Q;";Errors=@(547)},
 @{Name='Producto y presentacion cruzados rechazados';Sql="UPDATE dbo.ProformasProveedorDetalle SET IdProducto=@OtroProducto WHERE IdProformaProveedorDetalle=@QD;";Errors=@(547)},
 @{Name='Destinatario duplicado rechazado';Sql="INSERT dbo.SolicitudesCotizacionProveedor(IdSolicitudCotizacion,IdProveedor)VALUES(@S1,@Proveedor);";Errors=@(2601,2627)},
 @{Name='Numero de linea de oferta duplicado rechazado';Sql="INSERT dbo.ProformasProveedorDetalle(IdProformaProveedor,IdSolicitudCotizacion,IdSolicitudCotizacionDetalle,NumeroLineaDocumento,EstadoOferta)VALUES(@Q,@S1,@D1,1,'SinCotizar');";Errors=@(2601,2627)},
 @{Name='Solicitud emitida conserva sus lineas';Sql="UPDATE dbo.SolicitudesCotizacionDetalle SET CantidadEmpaquesSolicitada=3 WHERE IdSolicitudCotizacionDetalle=@D1;";Errors=@(51110)},
 @{Name='Solicitud emitida conserva su cabecera';Sql="UPDATE dbo.SolicitudesCotizacion SET Observaciones=N'cambio tardio' WHERE IdSolicitudCotizacion=@S1;";Errors=@(51107)},
 @{Name='No se valida sin conciliacion declarada';Sql="EXEC dbo.usp_Proforma_Validar @Q;";Errors=@(547)},
 @{Name='No se valida con lineas pendientes';Setup="UPDATE dbo.ProformasProveedor SET EstadoConciliacion='Conciliada' WHERE IdProformaProveedor=@Q;";Sql="EXEC dbo.usp_Proforma_Validar @Q;";Errors=@(51122)},
 @{Name='Precio ausente no equivale a cero';Sql="UPDATE dbo.ProformasProveedorDetalle SET PrecioUnitario=NULL,EstadoRevision='Revisada' WHERE IdProformaProveedorDetalle=@QD;";Errors=@(547)},
 @{Name='Sin cotizar no admite precio cero artificial';Sql="UPDATE dbo.ProformasProveedorDetalle SET EstadoOferta='SinCotizar',PrecioUnitario=0,TotalLinea=NULL WHERE IdProformaProveedorDetalle=@QD;";Errors=@(547)},
 @{Name='Moneda en minusculas rechazada';Sql="UPDATE dbo.ProformasProveedor SET Moneda='crc' WHERE IdProformaProveedor=@Q;";Errors=@(547)},
 @{Name='Cantidad negativa rechazada';Sql="UPDATE dbo.ProformasProveedorDetalle SET Cantidad=-1 WHERE IdProformaProveedorDetalle=@QD;";Errors=@(547)},
 @{Name='Extraccion JSON invalida rechazada';Sql="INSERT dbo.ImportacionesDocumento(IdDocumento,VersionLector,Metodo,Estado,DatosExtraidosJson)VALUES(@DocumentoRecibido,N'prueba','Manual','Parcial',N'no es json');";Errors=@(547)},
 @{Name='Documento original inmutable';Sql="UPDATE dbo.Documentos SET NombreOriginal=N'alterado.pdf' WHERE IdDocumento=@DocumentoRecibido;";Errors=@(51100)},
 @{Name='Extraccion original inmutable';Sql="UPDATE dbo.ImportacionesDocumento SET DatosExtraidosJson=N'{}' WHERE IdImportacionDocumento=@Importacion;";Errors=@(51101)},
 @{Name='Historial de ajustes inmutable';Setup="UPDATE dbo.ProformasProveedorDetalle SET PrecioUnitario=105 WHERE IdProformaProveedorDetalle=@QD;";Sql="UPDATE dbo.CambiosCotizacion SET Motivo=N'borrar rastro' WHERE IdProformaProveedor=@Q;";Errors=@(51102)},
 @{Name='Cotizacion validada conserva cabecera';Setup=$validar;Sql="UPDATE dbo.ProformasProveedor SET Total=1 WHERE IdProformaProveedor=@Q;";Errors=@(51116)},
 @{Name='Cotizacion validada conserva detalle';Setup=$validar;Sql="UPDATE dbo.ProformasProveedorDetalle SET PrecioUnitario=1 WHERE IdProformaProveedorDetalle=@QD;";Errors=@(51123)},
 @{Name='Nueva revision conserva anterior y reemplaza oferta vigente';Setup=$validar;Sql=@'
DECLARE @Q2 int;
SET @Cabecera=JSON_MODIFY(@Cabecera,'$.total',180); SET @Cabecera=JSON_MODIFY(@Cabecera,'$.subtotal',180);
SET @Lineas=JSON_MODIFY(@Lineas,'$[0].precioUnitario',90); SET @Lineas=JSON_MODIFY(@Lineas,'$[0].totalLinea',180);
EXEC dbo.usp_Proforma_GuardarBorrador @SP1,@DocumentoRecibido,@Importacion,@Cabecera,@Lineas,@Q2 OUTPUT;
UPDATE dbo.ProformasProveedorDetalle SET EstadoRevision='Revisada' WHERE IdProformaProveedor=@Q2;
UPDATE dbo.ProformasProveedor SET EstadoConciliacion='Conciliada' WHERE IdProformaProveedor=@Q2;
EXEC dbo.usp_Proforma_Validar @Q2;
IF NOT EXISTS(SELECT 1 FROM dbo.ProformasProveedor WHERE IdProformaProveedor=@Q2 AND VersionRespuesta=2 AND IdProformaAnterior=@Q) THROW 51901,N'Revision sin enlace',1;
IF (SELECT COUNT(*) FROM dbo.vw_OfertasValidadasVigentes WHERE IdSolicitudCotizacionProveedor=@SP1)<>1 THROW 51901,N'Duplico ofertas vigentes',1;
IF NOT EXISTS(SELECT 1 FROM dbo.vw_OfertasValidadasVigentes WHERE IdProformaProveedor=@Q2 AND PrecioPorEmpaqueDocumento=90) THROW 51901,N'No eligio revision nueva',1;
IF (SELECT PrecioUnitario FROM dbo.ProformasProveedorDetalle WHERE IdProformaProveedorDetalle=@QD)<>100 THROW 51901,N'Alteracion del original',1;
'@},
 @{Name='Equivalencias separadas por proveedor';Sql=@'
INSERT dbo.CompraAutomaticaEquivalencias(IdProveedor,CodigoProveedor,DescripcionProveedor,IdProducto,IdPresentacionProducto)
VALUES(@Proveedor,N'MISMO-CODIGO',N'Prueba',@P,@PP),(@OtroProveedor,N'MISMO-CODIGO',N'Prueba',@OtroProducto,@OtraPresentacion);
DECLARE @Encontrados TABLE(IdProducto int,IdPresentacionProducto int,NombreProducto nvarchar(150),NombrePresentacion nvarchar(150));
INSERT @Encontrados EXEC dbo.SP_CompraAutomatica_BuscarEquivalencia N'MISMO-CODIGO',N'Prueba',@Proveedor;
IF (SELECT COUNT(*) FROM @Encontrados)<>1 OR NOT EXISTS(SELECT 1 FROM @Encontrados WHERE IdProducto=@P) THROW 51901,N'Equivalencia ajena',1;
DELETE @Encontrados;
INSERT @Encontrados EXEC dbo.SP_CompraAutomatica_BuscarEquivalencia N'MISMO-CODIGO',N'Prueba',@OtroProveedor;
IF (SELECT COUNT(*) FROM @Encontrados)<>1 OR NOT EXISTS(SELECT 1 FROM @Encontrados WHERE IdProducto=@OtroProducto) THROW 51901,N'Equivalencia ajena',1;
'@},
 @{Name='Codigo activo duplicado del mismo proveedor rechazado';Setup="INSERT dbo.CompraAutomaticaEquivalencias(IdProveedor,CodigoProveedor,DescripcionProveedor,IdProducto)VALUES(@Proveedor,N'X',N'Prueba',@P);";Sql="INSERT dbo.CompraAutomaticaEquivalencias(IdProveedor,CodigoProveedor,DescripcionProveedor,IdProducto)VALUES(@Proveedor,N' x ',N'Otra',@OtroProducto);";Errors=@(2601,2627)},
 @{Name='Equivalencia con presentacion ajena rechazada';Sql="INSERT dbo.CompraAutomaticaEquivalencias(IdProveedor,CodigoProveedor,DescripcionProveedor,IdProducto,IdPresentacionProducto)VALUES(@Proveedor,N'X',N'Prueba',@P,@OtraPresentacion);";Errors=@(547)},
 @{Name='Contenido normalizado incoherente rechazado';Sql="UPDATE dbo.ProformasProveedorDetalle SET ContenidoNormalizadoOriginal=@Normalizada+1 WHERE IdProformaProveedorDetalle=@QD;";Errors=@(547)},
 @{Name='Conversion utilizada no se reinterpreta';Sql="UPDATE dbo.UnidadesMedida SET Codigo=N'OTRA-UNIDAD' WHERE IdUnidadMedida=@U;";Errors=@(51105)},
 @{Name='Presentacion utilizada no cambia contenido';Sql="UPDATE dbo.PresentacionesProducto SET Cantidad=Cantidad*2,CantidadNormalizada=CantidadNormalizada*2 WHERE IdPresentacionProducto=@PP;";Errors=@(51104)},
 @{Name='Alternativa prohibida por solicitud rechazada';BeforeEmit="UPDATE dbo.SolicitudesCotizacionDetalle SET PermiteAlternativas=0 WHERE IdSolicitudCotizacionDetalle=@D1;";Sql="UPDATE dbo.ProformasProveedorDetalle SET TipoOferta='Alternativa',MotivoAlternativa=N'Propuesta del proveedor',EstadoRevision='Revisada' WHERE IdProformaProveedorDetalle=@QD;";Errors=@(51124)},
 @{Name='No se disfraza otro producto como solicitado';Sql="UPDATE dbo.ProformasProveedorDetalle SET IdProducto=@OtroProducto,IdPresentacionProducto=@OtraPresentacion,EstadoRevision='Revisada' WHERE IdProformaProveedorDetalle=@QD;";Errors=@(51124)},
 @{Name='Importacion de otro PDF rechazada';Sql="UPDATE dbo.ProformasProveedor SET IdDocumentoOrigen=@DocumentoOtro WHERE IdProformaProveedor=@Q;";Errors=@(547)},
 @{Name='No disponible conserva ausencia de oferta';Sql=@'
UPDATE dbo.ProformasProveedorDetalle SET EstadoOferta='NoDisponible',Cantidad=NULL,PrecioUnitario=NULL,TotalLinea=NULL,EstadoRevision='Revisada' WHERE IdProformaProveedorDetalle=@QD;
UPDATE dbo.ProformasProveedor SET Subtotal=0,Descuento=0,IVA=0,Total=0,OtrosCargos=0,EstadoConciliacion='Conciliada' WHERE IdProformaProveedor=@Q;
EXEC dbo.usp_Proforma_Validar @Q;
IF EXISTS(SELECT 1 FROM dbo.vw_OfertasValidadasVigentes WHERE IdProformaProveedor=@Q) THROW 51901,N'Convirtio falta de oferta en precio',1;
'@},
 @{Name='Auditoria conserva antes y despues';Sql="UPDATE dbo.ProformasProveedorDetalle SET PrecioUnitario=105 WHERE IdProformaProveedorDetalle=@QD; IF NOT EXISTS(SELECT 1 FROM dbo.CambiosCotizacion WHERE IdProformaProveedorDetalle=@QD AND TRY_CONVERT(decimal(18,6),JSON_VALUE(CambiosJson,'$.antes.PrecioUnitario'))=100 AND TRY_CONVERT(decimal(18,6),JSON_VALUE(CambiosJson,'$.despues.PrecioUnitario'))=105) THROW 51901,N'No guarda ambos valores',1;"},
 @{Name='Cambio de etiqueta de marca no altera copia historica';Sql="DECLARE @IdM int=(SELECT IdMarca FROM dbo.Productos WHERE IdProducto=@P); UPDATE dbo.Marcas SET Nombre=N'MARCA PRUEBA CAMBIADA' WHERE IdMarca=@IdM; IF (SELECT MarcaOriginal FROM dbo.SolicitudesCotizacionDetalle WHERE IdSolicitudCotizacionDetalle=@D1)<>@Marca THROW 51901,N'Reescribio historia',1; IF (SELECT Marca FROM dbo.Productos WHERE IdProducto=@P)<>N'MARCA PRUEBA CAMBIADA' THROW 51901,N'Etiqueta desincronizada',1;"},
 @{Name='Precision de cantidades conservada';Sql="UPDATE dbo.ProformasProveedorDetalle SET Cantidad=0.1250 WHERE IdProformaProveedorDetalle=@QD; IF (SELECT Cantidad FROM dbo.ProformasProveedorDetalle WHERE IdProformaProveedorDetalle=@QD)<>0.1250 THROW 51901,N'Redondeo indebido',1;"},
 @{Name='Identidad fiscal duplicada rechazada';Setup="UPDATE dbo.Proveedores SET PaisIdentificacion='CR',TipoIdentificacion=N'PRUEBA',IdentificacionFiscal=N'PRUEBA-123' WHERE IdProveedor=@Proveedor;";Sql="UPDATE dbo.Proveedores SET PaisIdentificacion='CR',TipoIdentificacion=N'PRUEBA',IdentificacionFiscal=N'PRUEBA-123' WHERE IdProveedor=@OtroProveedor;";Errors=@(2601,2627)},
 @{Name='Fallo de detalle cancela guardado atomico';Setup="UPDATE dbo.ProformasProveedor SET Estado='Cancelada' WHERE IdProformaProveedor=@Q;";Sql="DECLARE @Fallida int; SET @Lineas=JSON_MODIFY(@Lineas,'$[0].cantidadEmpaques',-1); EXEC dbo.usp_Proforma_GuardarBorrador @SP1,@DocumentoRecibido,@Importacion,@Cabecera,@Lineas,@Fallida OUTPUT;";Errors=@(547)},
 @{Name='No se crea nueva version sobre borrador';Sql="DECLARE @Otra int; EXEC dbo.usp_Proforma_GuardarBorrador @SP1,@DocumentoRecibido,@Importacion,@Cabecera,@Lineas,@Otra OUTPUT;";Errors=@(51205)},
 @{Name='Todas las restricciones habilitadas y confiables';Sql="IF EXISTS(SELECT 1 FROM sys.check_constraints WHERE is_disabled=1 OR is_not_trusted=1) OR EXISTS(SELECT 1 FROM sys.foreign_keys WHERE is_disabled=1 OR is_not_trusted=1) THROW 51901,N'Restricciones sin verificar',1;"}
)

$cases += @(Get-Content (Join-Path $PSScriptRoot 'casos-procedimientos.json') -Raw -Encoding utf8 | ConvertFrom-Json)
$ddl=@()
if($Candidate){$ddl=@(Get-ChildItem (Join-Path $PSScriptRoot '../migrations/20261016_02_procedimientos') -Filter '0*.sql' | Sort-Object Name | ForEach-Object{[regex]::Split((Get-Content $_.FullName -Raw -Encoding utf8),'(?im)^\s*GO\s*(?:--[^\r\n]*)?\r?$')} | Where-Object{ -not [string]::IsNullOrWhiteSpace($_)})}
$connection=New-Object System.Data.SqlClient.SqlConnection
$connection.ConnectionString='Server=localhost;Database=BDComprasFertilizantes;Integrated Security=True;Encrypt=True;TrustServerCertificate=True;Connect Timeout=10;Application Name=GestorFertilizantesSchemaVerification'
$results=@()
try{
 $connection.Open()
 foreach($case in $cases){
  $transaction=$connection.BeginTransaction()
  $phase='fixture'
  $success=$false;$detail=$null
  try{
   $command=$connection.CreateCommand();$command.Transaction=$transaction;$command.CommandTimeout=60
   foreach($batch in $ddl){$command.CommandText=$batch;[void]$command.ExecuteNonQuery()}
   $body=$fixture.Replace('-- TEST_BEFORE_EMIT',[string]$case.BeforeEmit)+"`n"+[string]$case.Setup+"`n"
   # La fixture y el caso comparten variables, pero un error de preparacion
   # no se acepta como el error esperado del caso.
   $body += "`nRAISERROR('TEST_ACTION_START',10,1) WITH NOWAIT;`n"+$case.Sql
   $actionStarted=$false
   $handler=[System.Data.SqlClient.SqlInfoMessageEventHandler]{param($sender,$eventArgs) if($eventArgs.Message -match 'TEST_ACTION_START'){$script:actionStarted=$true}}
   $script:actionStarted=$false
   $connection.add_InfoMessage($handler)
   $command.CommandText=$body
   try{
    [void]$command.ExecuteNonQuery()
    if($case.Errors){$detail='La operacion prohibida fue aceptada.'}else{$success=$true}
   }catch{
    $exception=$_.Exception
    while($exception.InnerException){$exception=$exception.InnerException}
    $numbers=@();if($exception -is [System.Data.SqlClient.SqlException]){$numbers=@($exception.Errors|ForEach-Object{$_.Number})}
    $actionWasReached=$script:actionStarted -or $exception.Message.Contains('TEST_ACTION_START')
    if($actionWasReached -and $case.Errors -and @($numbers|Where-Object{$_ -in $case.Errors}).Count -gt 0){$success=$true;$detail='Rechazo esperado: '+($numbers -join ',')}
    else{$detail=$exception.Message}
   }finally{$connection.remove_InfoMessage($handler);$command.Dispose()}
  }catch{$detail=$_.Exception.Message}
  finally{try{$transaction.Rollback()}catch{};$transaction.Dispose()}
  $results += [pscustomobject]@{Prueba=$case.Name;Resultado=if($success){'OK'}else{'FALLO'};Detalle=$detail}
  $statusLabel=if($success){'OK'}else{'FALLO'}
  Write-Output ($statusLabel+' - '+$case.Name)
 }
}finally{$connection.Dispose()}
$results|ConvertTo-Json -Depth 5|Set-Content -LiteralPath (Join-Path $PSScriptRoot 'resultados-pruebas.json') -Encoding utf8
$failed=@($results|Where-Object Resultado -eq 'FALLO')
Write-Output ('Total: '+$results.Count+'; correctas: '+($results.Count-$failed.Count)+'; fallos: '+$failed.Count)
if($failed.Count){$failed|ConvertTo-Json -Depth 5;exit 1}
