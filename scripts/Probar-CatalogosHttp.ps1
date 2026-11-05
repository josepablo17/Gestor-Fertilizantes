[CmdletBinding()]
param(
    [Parameter(Mandatory)][Net.Http.HttpClient]$Cliente,
    [Parameter(Mandatory)][string]$Direccion
)

$ErrorActionPreference='Stop'
# Estas escrituras solo se permiten sobre la base efimera creada por Compose Test.
$connection=[Data.Common.DbConnectionStringBuilder]::new()
$connection.set_ConnectionString($env:GF_API_TEST_CONNECTION_STRING)
$database=$null
if(-not $connection.TryGetValue('Database',[ref]$database)){
    $null=$connection.TryGetValue('Initial Catalog',[ref]$database)
}
if($database -cnotmatch '^GF_DB_COMPOSE_[a-f0-9]{32}$'){throw 'Catalogos HTTP solo admite la base temporal propia de Compose.'}
$checks=[Collections.Generic.List[object]]::new()

function Invoke-Catalogo([string]$Metodo,[string]$Ruta,[int]$Estado,$Datos=$null){
    $request=[Net.Http.HttpRequestMessage]::new([Net.Http.HttpMethod]::new($Metodo),"$Direccion/api/$Ruta")
    $response=$null
    try{
        if($null -ne $Datos){$request.Content=[Net.Http.StringContent]::new(($Datos | ConvertTo-Json -Depth 10 -Compress),[Text.Encoding]::UTF8,'application/json')}
        $response=$Cliente.SendAsync($request).GetAwaiter().GetResult()
        $body=$response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json
        if([int]$response.StatusCode -ne $Estado){throw "$Metodo $Ruta no devolvio HTTP $Estado (obtenido $([int]$response.StatusCode))."}
        if($Estado -ge 400 -and $body.exito -ne $false){throw 'Error de catalogo sin envoltorio esperado.'}
        if($Estado -eq 201 -and -not $response.Headers.Location){throw 'El alta no devuelve Location.'}
        $checks.Add([ordered]@{Caso="$Metodo $Ruta produce $Estado";Estado='Aprobado'})
        return $body
    }finally{if($response){$response.Dispose()};$request.Dispose()}
}

function Assert-Catalogo([bool]$Condicion,[string]$Caso){
    if(-not $Condicion){throw $Caso}
    $checks.Add([ordered]@{Caso=$Caso;Estado='Aprobado'})
}

$suffix=[guid]::NewGuid().ToString('N')
$marca=@{nombre="Marca $suffix"}
$idMarca=(Invoke-Catalogo POST 'Marca/InsertarMarca' 201 $marca).data.idMarca
$idBase=(Invoke-Catalogo POST 'ProductoBase/InsertarProductoBase' 201 @{codigo="B-$suffix";nombre="Base $suffix";formulaDeclarada='12-60-0';comparabilidadRevisada=$false}).data.idProductoBase
$base=(Invoke-Catalogo GET "ProductoBase/ObtenerProductoBase/$idBase" 200).data
Assert-Catalogo ($base.comparabilidadRevisada -eq $false -and $base.formulaDeclarada -eq '12-60-0') 'La formula no activa comparabilidad automaticamente'
$null=Invoke-Catalogo POST 'Marca/InsertarMarca' 409 $marca
$null=Invoke-Catalogo POST 'ProductoBase/InsertarProductoBase' 409 @{codigo="B-$suffix";nombre='Otra base'}

$producto=@{nombre="Producto $suffix";idProductoBase=$idBase;idMarca=$idMarca;descripcion='Descripcion comercial'}
$idProducto=(Invoke-Catalogo POST 'Producto/InsertarProducto' 201 $producto).data.idProducto
$comercial=(Invoke-Catalogo GET "Producto/ObtenerProducto/$idProducto" 200).data
Assert-Catalogo ($comercial.idProductoBase -eq $idBase -and $comercial.idMarca -eq $idMarca -and $comercial.marca -eq $marca.nombre -and $comercial.codigoInterno) 'Producto devuelve identidad base, marca y codigo generado'
$sinMarca=(Invoke-Catalogo POST 'Producto/InsertarProducto' 201 @{nombre="Sin marca $suffix";idProductoBase=$idBase}).data.idProducto
$sinMarcaDatos=(Invoke-Catalogo GET "Producto/ObtenerProducto/$sinMarca" 200).data
Assert-Catalogo ($null -eq $sinMarcaDatos.idMarca -and $null -eq $sinMarcaDatos.marca -and $null -eq $sinMarcaDatos.categoria) 'Marca y categoria opcionales conservan null'
$null=Invoke-Catalogo POST 'Producto/InsertarProducto' 400 @{nombre='Sin base';marca='Texto antiguo'}
$null=Invoke-Catalogo POST 'Producto/InsertarProducto' 400 @{nombre='Base inexistente';idProductoBase=2147483647}
$null=Invoke-Catalogo POST 'Producto/InsertarProducto' 409 @{nombre='Codigo duplicado';idProductoBase=$idBase;codigoInterno=$comercial.codigoInterno}
$filtrados=(Invoke-Catalogo GET "Producto/ListarProducto?idProductoBase=$idBase&idMarca=$idMarca&soloActivos=true" 200).data
Assert-Catalogo (@($filtrados).Count -eq 1 -and $filtrados[0].idProducto -eq $idProducto) 'Filtros de base y marca llegan a SQL'
$null=Invoke-Catalogo PUT 'Marca/ActualizarMarca' 200 @{idMarca=$idMarca;nombre="Marca revisada $suffix"}
$comercial=(Invoke-Catalogo GET "Producto/ObtenerProducto/$idProducto" 200).data
Assert-Catalogo ($comercial.marca -eq "Marca revisada $suffix") 'Consulta de producto refleja el nombre actual de la marca'

$codigoUnidad='C'+$suffix.Substring(0,12)
$unidad=@{codigo=$codigoUnidad;nombre="Unidad $suffix";tipoBase='peso';factorConversion=0.001;esUnidadBase=$false}
$idUnidad=(Invoke-Catalogo POST 'UnidadMedida/InsertarUnidadMedida' 201 $unidad).data.idUnidadMedida
$unidadDatos=(Invoke-Catalogo GET "UnidadMedida/ObtenerUnidadMedida/$idUnidad" 200).data
Assert-Catalogo ($unidadDatos.tipoBase -eq 'PESO' -and $unidadDatos.factorConversion -eq 0.001) 'Unidad normaliza dimension y conserva factor decimal'
$presentacion=@{idProducto=$idProducto;descripcion='Saco';cantidad=25000;idUnidadMedida=$idUnidad}
$idPresentacion=(Invoke-Catalogo POST 'PresentacionProducto/InsertarPresentacionProducto' 201 $presentacion).data.idPresentacionProducto
$empaque=(Invoke-Catalogo GET "PresentacionProducto/ObtenerPresentacionProducto/$idPresentacion" 200).data
Assert-Catalogo ($empaque.cantidadNormalizada -eq 25 -and $empaque.tipoBase -eq 'PESO' -and $empaque.codigoUnidadMedida -eq $codigoUnidad.ToUpperInvariant()) 'SQL calcula 25000 por 0.001 como 25 de peso'
$null=Invoke-Catalogo POST 'PresentacionProducto/InsertarPresentacionProducto' 400 @{idProducto=$idProducto;descripcion='Manipulada';cantidad=25;idUnidadMedida=$idUnidad;cantidadNormalizada=999}
$null=Invoke-Catalogo POST 'PresentacionProducto/InsertarPresentacionProducto' 400 @{idProducto=$idProducto;descripcion='Redondeo';cantidad=1.00001;idUnidadMedida=$idUnidad}
$null=Invoke-Catalogo POST 'PresentacionProducto/InsertarPresentacionProducto' 400 @{idProducto=$idProducto;descripcion='Desbordamiento';cantidad=100000000000000;idUnidadMedida=$idUnidad}
$null=Invoke-Catalogo POST 'PresentacionProducto/InsertarPresentacionProducto' 409 $presentacion
$null=Invoke-Catalogo PUT 'UnidadMedida/ActualizarUnidadMedida' 409 @{idUnidadMedida=$idUnidad;codigo=$codigoUnidad;nombre=$unidad.nombre;tipoBase='PESO';factorConversion=0.002;esUnidadBase=$false}
$null=Invoke-Catalogo PUT 'PresentacionProducto/ActualizarPresentacionProducto' 200 @{idPresentacionProducto=$idPresentacion;idProducto=$idProducto;descripcion='Saco revisado';cantidad=25000;idUnidadMedida=$idUnidad}
$presentaciones=(Invoke-Catalogo GET "PresentacionProducto/ListarPresentacionesProducto?idProducto=$idProducto&soloActivos=true" 200).data
Assert-Catalogo (@($presentaciones).Count -eq 1 -and $presentaciones[0].descripcion -eq 'Saco revisado') 'Presentaciones filtra por producto y guarda la descripcion'
$opciones=(Invoke-Catalogo GET 'PresentacionProducto/ListarUnidadesMedidaDropdown' 200).data
Assert-Catalogo (@($opciones | Where-Object {$_.idUnidadMedida -eq $idUnidad -and $_.factorConversion -eq 0.001 -and $_.tipoBase -eq 'PESO'}).Count -eq 1) 'Opciones de unidad incluyen dimension y factor'

$proveedor=@{nombre="Proveedor $suffix";direccion='Direccion';provincia='Cartago';canton='Oreamuno';distrito='San Rafael';tipoIdentificacion='Juridica';identificacionFiscal=$suffix;paisIdentificacion='CR';fuenteExterna='Prueba';idExterno=$suffix;esProveedorAutorizado=$true}
$idProveedor=(Invoke-Catalogo POST 'Proveedor/InsertarProveedor' 201 $proveedor).data.idProveedor
$proveedorDatos=(Invoke-Catalogo GET "Proveedor/ObtenerProveedor/$idProveedor" 200).data
Assert-Catalogo ($proveedorDatos.identificacionFiscal -eq $suffix -and $proveedorDatos.paisIdentificacion -eq 'CR' -and $proveedorDatos.canton -eq 'Oreamuno' -and $proveedorDatos.idExterno -eq $suffix -and $null -eq $proveedorDatos.fechaModificacion) 'Proveedor conserva datos fiscales, ubicacion, origen y fecha nula'
$proveedor.idProveedor=$idProveedor
$proveedor.direccion='Direccion revisada'
$null=Invoke-Catalogo PUT 'Proveedor/ActualizarProveedor' 200 $proveedor
$proveedorDatos=(Invoke-Catalogo GET "Proveedor/ObtenerProveedor/$idProveedor" 200).data
Assert-Catalogo ($proveedorDatos.direccion -eq 'Direccion revisada' -and $null -ne $proveedorDatos.fechaModificacion) 'Proveedor actualiza todos los campos declarados'
$duplicado=$proveedor.Clone();$duplicado.Remove('idProveedor')
$null=Invoke-Catalogo POST 'Proveedor/InsertarProveedor' 409 $duplicado
$null=Invoke-Catalogo POST 'Proveedor/InsertarProveedor' 400 @{nombre='Fiscal incompleto';identificacionFiscal='123'}
$null=Invoke-Catalogo POST 'Proveedor/InsertarProveedor' 400 @{nombre='Correo incorrecto';correo='abc'}
$null=Invoke-Catalogo PUT 'ProductoBase/ActualizarProductoBase' 200 @{idProductoBase=$idBase;codigo="B-$suffix";nombre=$base.nombre;formulaDeclarada='12-60-0';comparabilidadRevisada=$true}
$base=(Invoke-Catalogo GET "ProductoBase/ObtenerProductoBase/$idBase" 200).data
Assert-Catalogo ($base.comparabilidadRevisada -eq $true) 'La revision de comparabilidad se guarda explicitamente'

$null=Invoke-Catalogo PUT "Marca/CambiarActivo/$idMarca" 400 @{}
$null=Invoke-Catalogo PUT "Marca/CambiarActivo/$idMarca" 200 @{activo=$false}
$null=Invoke-Catalogo POST 'Producto/InsertarProducto' 400 @{nombre='Marca inactiva';idProductoBase=$idBase;idMarca=$idMarca}
$opcionesProducto=(Invoke-Catalogo GET 'PresentacionProducto/ListarProductosDropdown' 200).data
Assert-Catalogo (@($opcionesProducto | Where-Object {$_.idProducto -eq $idProducto}).Count -eq 0) 'Opciones de producto excluyen marca inactiva'
$null=Invoke-Catalogo PUT "Marca/CambiarActivo/$idMarca" 200 @{activo=$true}
$null=Invoke-Catalogo PUT "ProductoBase/CambiarActivo/$idBase" 200 @{activo=$false}
$null=Invoke-Catalogo POST 'Producto/InsertarProducto' 400 @{nombre='Base inactiva';idProductoBase=$idBase}
$null=Invoke-Catalogo PUT "ProductoBase/CambiarActivo/$idBase" 200 @{activo=$true}
$null=Invoke-Catalogo DELETE "PresentacionProducto/Desactivar/$idPresentacion" 200
$null=Invoke-Catalogo DELETE "Producto/Desactivar/$idProducto" 200
$null=Invoke-Catalogo DELETE "UnidadMedida/Desactivar/$idUnidad" 200
$null=Invoke-Catalogo DELETE "Proveedor/Desactivar/$idProveedor" 200
$inactivos=(Invoke-Catalogo GET "Producto/ListarProducto?idProductoBase=$idBase&soloActivos=true" 200).data
Assert-Catalogo (@($inactivos | Where-Object {$_.idProducto -eq $idProducto}).Count -eq 0) 'Listado activo excluye producto desactivado'
$null=Invoke-Catalogo GET 'Marca/ObtenerMarca/2147483647' 404
$null=Invoke-Catalogo PUT 'ProductoBase/ActualizarProductoBase' 404 @{idProductoBase=2147483647;codigo='NO';nombre='Inexistente'}
$checks.ToArray()
