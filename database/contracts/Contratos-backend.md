# Contrato de integración del backend

El backend debe llamar a los procedimientos con parámetros tipados y `CommandType.StoredProcedure`. Usar `decimal` en C# para cantidades e importes; `long` para solicitudes, documentos, importaciones y compras; `int` para productos y proformas. No usar `double`, no convertir unidades mediante eliminación de dígitos y no interpretar un dato ausente como cero.

## Secuencia de trabajo

1. Cargar los catálogos y seleccionar productos comerciales y sus presentaciones. Un producto comercial pertenece a un producto base y opcionalmente a una marca por ID. La etiqueta de marca en `Productos.Marca` se mantiene como compatibilidad mediante los triggers.
2. Llamar a `usp_Solicitud_GuardarBorrador`, con `@IdSolicitudCotizacion = NULL` para crear o con su ID para reemplazar el borrador. La solicitud captura desde el catálogo nombre, marca, presentación, unidad, factor y contenido. Los proveedores se pasan como un arreglo JSON de IDs enteros.
3. Llamar a `usp_Solicitud_Emitir`. La emisión congela la identidad de los renglones. Generar el PDF con esos IDs y el número/versión de solicitud. El procedimiento no genera archivos.
4. Guardar el PDF generado en almacenamiento sin sobrescribir otros archivos; calcular el SHA-256 real y llamar a `usp_Documento_Registrar` con origen `Generado`. Registrar el envío real por destinatario con `usp_Solicitud_RegistrarEnvio`. Este último solo registra evidencia; no envía correos.
5. Al recibir un PDF, almacenarlo como un nuevo documento con origen `Recibido`. Si se ejecuta el lector determinista, guardar su salida intacta en `usp_Importacion_Registrar`, incluyendo versión del lector, método, advertencias y resultado. El método `Manual` también está disponible; una respuesta puede tener documento sin importación.
6. Llamar a `usp_Proforma_GuardarBorrador` con el destinatario de la solicitud, documento, importación opcional, cabecera y líneas. La cabecera y todas sus líneas se guardan juntas. Devuelve el ID mediante parámetro `OUTPUT`. Siempre empieza como borrador con revisión pendiente. No crea compras.
7. Mostrar el documento y los datos extraídos al usuario. Usar `usp_Proforma_ActualizarCabecera`, `usp_Proforma_ActualizarLinea` y `usp_Proforma_AgregarLinea` con un motivo. La actualización de una línea reinicia su revisión; cualquier ajuste de datos reinicia la conciliación. Las modificaciones conservan antes/después y el motivo, sin alterar documento o extracción originales.
8. Confirmar cada renglón con `usp_Proforma_RevisarLinea`, conciliar la cabecera con `usp_Proforma_Conciliar` y finalizar con `usp_Proforma_Validar`. La base rechaza validaciones incompletas o vínculos cruzados.
9. Comparar con `usp_Cotizaciones_CompararSolicitud`, indicando moneda, base del importe de línea y fecha para comprobar vencimiento.
10. Para corregir una respuesta finalizada, usar `usp_Proforma_CrearRevision` o guardar una nueva respuesta con su documento correspondiente. La primera opción clona la interpretación para corregirla sobre la misma evidencia. Ambas crean otra versión pendiente y conservan la anterior. Hasta validar la nueva, la última versión validada sigue disponible para comparar.

Un borrador de solicitud se guarda por reemplazo completo: los IDs de sus líneas y destinatarios pueden cambiar hasta emitir. Tras emitir, usar `usp_Solicitud_CrearRevision` para una nueva versión; no regenerar el PDF de una solicitud existente alterando sus datos.

## JSON de solicitud

Los nombres distinguen mayúsculas y minúsculas. Sustituir los IDs del ejemplo por IDs relacionados del catálogo real. `cantidadEmpaques` es número de sacos/bidones/etc., **no** su contenido en kg/litros.

```json
[
  {
    "numeroLinea": 1,
    "idProducto": 1,
    "idPresentacionProducto": 1,
    "cantidadEmpaques": 48,
    "permiteAlternativas": true,
    "observaciones": "Cotizar esta presentacion o indicar alternativa"
  }
]
```

Proveedores: `[1, 2]`. `DatosClienteOriginalJson` es un objeto con, al menos para emitir, `nombre`. No confundir al cliente con el proveedor emisor de la proforma.

## JSON de respuesta

Ejemplo de cabecera; los importes y datos son ilustrativos, no una transcripción de la proforma real del usuario:

```json
{
  "numeroProforma": "PROV-0001",
  "fechaProforma": "2026-10-16",
  "fechaVencimiento": "2026-10-24",
  "moneda": "CRC",
  "subtotal": 200,
  "descuento": 20,
  "iva": 10,
  "otrosCargos": 5,
  "total": 195,
  "datosProveedorOriginal": { "nombre": "Proveedor del PDF" },
  "datosClienteOriginal": { "nombre": "Cliente del PDF" },
  "condicionesPago": "Efectivo o transferencia"
}
```

Campos adicionales admitidos: `diasCredito`, `tipoDocumento`, `nombreProveedorPdf`, `nombreNegocio`, `razonSocial`, `cedula`, `telefono`, `vendedor`, `condicionesEntrega`, `observaciones`.

Ejemplo de renglón, con IDs ilustrativos. Las copias de unidad, contenido y factor deben corresponder a la presentación seleccionada; no se permite inventarlas para hacer que los números cuadren.

```json
[
  {
    "idSolicitudDetalle": 101,
    "numeroLinea": 1,
    "codigo": "001-1728",
    "descripcion": "Producto como aparece en el documento",
    "idProducto": 1,
    "idPresentacionProducto": 1,
    "cantidadEmpaques": 2,
    "precioUnitario": 100,
    "descuentoPorcentaje": 0,
    "totalLinea": 200,
    "tipoOferta": "Solicitada",
    "estadoOferta": "Cotizada",
    "nombreProductoOriginal": "Nombre revisado",
    "marcaOriginal": "Marca del producto",
    "presentacionOriginal": "Saco 25 kg",
    "contenidoEmpaqueOriginal": 25,
    "idUnidadMedidaOriginal": 1,
    "codigoUnidadOriginal": "KG",
    "tipoBaseOriginal": "PESO",
    "factorConversionOriginal": 1,
    "contenidoNormalizadoOriginal": 25,
    "baseTotalLinea": "Bruto"
  }
]
```

Campos adicionales de línea: `descuentoMonto`, `impuestoMonto`, `motivoAlternativa`, `observacion`. Se conservan códigos alfanuméricos de longitud variable. El texto literal extraído sin corregir permanece en `ImportacionesDocumento`.

`ActualizarLinea` y `ActualizarCabecera` reciben **objetos completos**, no parches: los campos omitidos quedan nulos o toman los valores predeterminados documentados en SQL. `AgregarLinea` recibe un objeto, no un arreglo. El guardado inicial recibe un arreglo. Las propiedades desconocidas/duplicadas, textos JSON demasiado largos y decimales JSON que perderían precisión se rechazan. Para parámetros SQL escalares, validar longitudes y escala en la API antes de enviarlos, porque SQL Server puede convertir el valor al tipo del parámetro antes de entrar al procedimiento.

Tipos de oferta: `Solicitada`, `Alternativa`, `Adicional`. Las adicionales no apuntan a un renglón solicitado. Las alternativas necesitan motivo al revisarse y que la solicitud las permita.

Estados de oferta: `Cotizada`, `NoDisponible`, `SinCotizar`. En los dos últimos, precio, total, descuento por monto e impuesto por monto deben permanecer nulos; no llenar con ceros para simular una oferta. La revisión sigue siendo necesaria aunque el proveedor no cotice el renglón.

## Qué significa la comparación

Parámetros obligatorios: solicitud, moneda de tres letras mayúsculas, `BaseTotalLinea` y fecha de referencia. Bases admitidas:

- `Bruto`: total de línea antes de descuentos e impuestos de línea.
- `NetoSinImpuestos`: total de línea después de descuentos, antes de impuestos.
- `ConImpuestos`: total de línea con los impuestos de línea incluidos.

La base se declara después de revisar el documento. `SinDefinir` sirve durante la carga y bloquea la validación de una línea cotizada. No se infiere la base a partir del nombre de una columna del PDF.

Se usa el total de la línea, no el precio unitario aislado: un precio unitario bruto puede diferir del precio efectivo de esa línea. El denominador incluye la cantidad de empaques y el contenido normalizado de cada uno. KG y G se normalizan a peso; L y ML, a volumen. No se convierte entre peso, volumen y unidad.

El procedimiento selecciona la última respuesta **validada** de cada destinatario. Conserva los proveedores sin respuesta y renglones no cotizados. No pretende reconstruir qué versiones existían en una fecha histórica: `FechaReferencia` se usa para comprobar vencimiento.

Un producto distinto solo participa como equivalente si pertenece al mismo producto base y ese grupo tiene `ComparabilidadRevisada = 1`. No basta compartir una fórmula en el texto. Esta revisión es una decisión comercial del catálogo; modificarla puede cambiar comparaciones posteriores sin modificar las copias del documento histórico.

`EsMenorPrecioUnitario` considera las ofertas comparables e incluye las vencidas o parciales, cuyas condiciones se muestran. `EsMenorPrecioConCoberturaYVigencia` exige además cantidad suficiente y vencimiento conocido no anterior a la fecha de referencia. Los empates se mantienen; ninguna bandera constituye por sí sola una recomendación de compra completa.

Descuento global, IVA y otros cargos se muestran al nivel del documento. El backend debe presentarlos una sola vez por cotización, aunque se repitan como contexto en filas del comparador. No sumarlos por renglón. Tampoco volver a sumar automáticamente el IVA del documento sobre líneas declaradas con impuestos.

La conciliación comprueba exclusivamente `Total = Subtotal - Descuento + IVA + OtrosCargos` con tolerancia explícita de 0 a 1 unidad monetaria, predeterminada 0.01. Permite `ConDiferencias` si se explica el motivo. No reconcilia automáticamente suma de líneas, descuentos globales, bases imponibles o transporte. El usuario debe revisar esa correspondencia contra el PDF; aún no existe una política para asignar los ajustes globales.

## Resultados, transacciones y errores

- `usp_Solicitud_ObtenerPorId`: tres resultados ordenados: cabecera, renglones, destinatarios.
- `usp_Proforma_ObtenerCompleta`: tres resultados ordenados: cabecera con contexto/documento, renglones, historial de cambios. Usar `QueryMultipleAsync` de Dapper.
- Guardados/revisiones de solicitudes y proformas y registro de documentos/importaciones usan parámetros `OUTPUT` para sus IDs. Los CRUD tradicionales de catálogo devuelven una fila con el ID. Compras conserva IDs `bigint`.
- Listados paginados devuelven `TotalRegistros` por fila; un resultado vacío no trae fila de total. El backend debe manejar ese caso como cero y no depender de recibir una fila ficticia.
- Respetar la transacción del llamador: las escrituras compuestas usan transacción propia o un savepoint. Con `XACT_ABORT`, algunos errores invalidan la transacción externa; el backend debe revertirla en ese caso. Reintentar una operación completa deliberadamente, sin asumir idempotencia general.
- `52000`: entrada inválida; `52004`: no encontrado; `52009`: conflicto o ambigüedad que requiere selección; `52010`: estado/operación no permitida. Algunos contratos núcleo conservan `51201–51206`; los triggers de integridad usan `511xx`; `547` indica restricciones y `2601/2627`, unicidad. Mapear por número y contexto, sin devolver detalles SQL internos al usuario.
- No hay control optimista con `rowversion` ni token general de idempotencia. Para este primer despliegue local se usan transacciones, bloqueos y restricciones; no se declara probado un escenario multiusuario bajo carga.

## Cambios incompatibles respecto a la API anterior

- Productos: `IdProductoBase` obligatorio, `IdMarca` opcional; `CodigoInterno` opcional al crear.
- Proveedores: datos fiscales tipados y una única identidad externa/fiscal según las restricciones.
- Presentaciones: contenido positivo y normalización calculada en SQL. Unidades y contenido usados en historia no se reinterpretan.
- Cabecera de proforma y detalle: los procedimientos antiguos son adaptadores al contrato nuevo, que exige solicitud/destinatario, documento y JSON. No aceptan el guardado fragmentado antiguo como si bastara con producto/proveedor.
- `SP_CompraAutomatica_BuscarPresentacion`: ahora recibe cantidad decimal y unidad explícitas; el lector o la UI deben resolver el texto antes de llamar.
- `SP_CompraAutomatica_BuscarEquivalencia`: proveedor obligatorio; nunca mezcla empresas.
- `SP_CompraAutomatica_BuscarProducto` y proveedor no eligen arbitrariamente un candidato si existen varios. Una búsqueda de productos es propuesta de candidatos, no prueba de equivalencia.
- `SP_CompraAutomatica_InsertarCompraDesdeProforma` devuelve error deliberadamente. Importar no demuestra que ocurrió una compra.
- Los análisis históricos de compras siguen siendo independientes del comparador de cotizaciones. Las funciones de comparación de importes requieren moneda explícita. Varias columnas devueltas cambiaron; generar DTOs desde los contratos actuales, no asumir compatibilidad por conservar el nombre del SP.

## Inventario de firmas instalado

Las firmas siguientes se extraen de la instancia aplicada. La definición completa y los metadatos de parámetros están en `contratos.json`; los valores predeterminados de procedimientos T-SQL se leen de la firma, pues `sys.parameters` no los publica de forma fiable.

### SP_ComparadorProveedor_ObtenerComparativa

```sql
CREATE   PROCEDURE dbo.SP_ComparadorProveedor_ObtenerComparativa @IdProducto int,@IdPresentacionProducto int,@Moneda nvarchar(10),@MesesAnalisis int=NULL,@SoloAutorizados bit=0
```

### SP_ComparadorProveedor_ObtenerDetalleHistoricoProveedor

```sql
CREATE   PROCEDURE dbo.SP_ComparadorProveedor_ObtenerDetalleHistoricoProveedor @IdProducto int,@IdPresentacionProducto int,@IdProveedor int,@Moneda nvarchar(10),@MesesAnalisis int=NULL
```

### SP_Compra_Actualizar

```sql
CREATE   PROCEDURE dbo.SP_Compra_Actualizar @IdCompra bigint,@IdProducto int,@IdProveedor int,@IdPresentacionProducto int,@FechaCompra date,@CantidadComprada decimal(18,4),@PrecioTotal decimal(18,4),@Moneda nvarchar(10),@Observaciones nvarchar(500)=NULL
```

### SP_Compra_AlertasPorProducto

```sql
CREATE   PROCEDURE dbo.SP_Compra_AlertasPorProducto @IdProducto int,@IdPresentacionProducto int,@Moneda nvarchar(10)
```

### SP_Compra_EvaluarCompra

```sql
CREATE   PROCEDURE dbo.SP_Compra_EvaluarCompra @IdCompra bigint
```

### SP_Compra_HistorialPorProducto

```sql
CREATE   PROCEDURE dbo.SP_Compra_HistorialPorProducto @IdProducto int,@Moneda nvarchar(10)=NULL
```

### SP_Compra_HistorialPreciosPorProducto

```sql
CREATE   PROCEDURE dbo.SP_Compra_HistorialPreciosPorProducto @IdProducto int,@IdPresentacionProducto int,@Moneda nvarchar(10)
```

### SP_Compra_Insertar

```sql
CREATE   PROCEDURE dbo.SP_Compra_Insertar @IdProducto int,@IdProveedor int,@IdPresentacionProducto int,@FechaCompra date,@CantidadComprada decimal(18,4),@PrecioTotal decimal(18,4),@Moneda nvarchar(10),@Observaciones nvarchar(500)=NULL
```

### SP_Compra_Listar

```sql
CREATE   PROCEDURE dbo.SP_Compra_Listar @Moneda nvarchar(10)=NULL,@Pagina int=1,@TamanoPagina int=50
```

### SP_Compra_ObtenerPorId

```sql
CREATE   PROCEDURE dbo.SP_Compra_ObtenerPorId @IdCompra bigint
```

### SP_Compra_ResumenInteligentePrecios

```sql
CREATE   PROCEDURE dbo.SP_Compra_ResumenInteligentePrecios @IdProducto int,@IdPresentacionProducto int,@Moneda nvarchar(10)
```

### SP_Compra_UltimoPrecio

```sql
CREATE   PROCEDURE dbo.SP_Compra_UltimoPrecio @IdProducto int,@IdPresentacionProducto int,@Moneda nvarchar(10)
```

### SP_CompraAutomatica_BuscarEquivalencia

```sql
CREATE   PROCEDURE dbo.SP_CompraAutomatica_BuscarEquivalencia
 @CodigoProveedor nvarchar(100)=NULL,@DescripcionProveedor nvarchar(300),@IdProveedor int
```

### SP_CompraAutomatica_BuscarPresentacion

```sql
CREATE   PROCEDURE dbo.SP_CompraAutomatica_BuscarPresentacion
 @IdProducto int,@Cantidad decimal(18,6),@IdUnidadMedida int
```

### SP_CompraAutomatica_BuscarProducto

```sql
CREATE   PROCEDURE dbo.SP_CompraAutomatica_BuscarProducto @Descripcion nvarchar(500)
```

### SP_CompraAutomatica_BuscarProveedor

```sql
CREATE   PROCEDURE dbo.SP_CompraAutomatica_BuscarProveedor
 @NombreNegocio nvarchar(200)=NULL,@RazonSocial nvarchar(200)=NULL,
 @IdentificacionFiscal nvarchar(50)=NULL,@PaisIdentificacion char(2)=NULL,@TipoIdentificacion nvarchar(30)=NULL
```

### SP_CompraAutomatica_InsertarCompraDesdeProforma

```sql
CREATE   PROCEDURE dbo.SP_CompraAutomatica_InsertarCompraDesdeProforma @IdProducto int,@IdProveedor int,@IdPresentacionProducto int,@FechaCompra date,@CantidadComprada decimal(18,4),@PrecioTotal decimal(18,4),@Moneda nvarchar(10),@Observaciones nvarchar(500)=NULL
```

### SP_CompraAutomatica_InsertarEquivalencia

```sql
CREATE   PROCEDURE dbo.SP_CompraAutomatica_InsertarEquivalencia
 @IdProveedor int,@CodigoProveedor nvarchar(100)=NULL,@DescripcionProveedor nvarchar(300),@IdProducto int,@IdPresentacionProducto int=NULL
```

### SP_PresentacionesProducto_Actualizar

```sql
CREATE   PROCEDURE dbo.SP_PresentacionesProducto_Actualizar
 @IdPresentacionProducto int,@IdProducto int,@Descripcion nvarchar(150),@Cantidad decimal(18,4),@IdUnidadMedida int,@CantidadNormalizada decimal(18,6)=NULL
```

### SP_PresentacionesProducto_Desactivar

```sql
CREATE   PROCEDURE dbo.SP_PresentacionesProducto_Desactivar
 @IdPresentacionProducto int
```

### SP_PresentacionesProducto_Insertar

```sql
CREATE   PROCEDURE dbo.SP_PresentacionesProducto_Insertar
 @IdProducto int,@Descripcion nvarchar(150),@Cantidad decimal(18,4),@IdUnidadMedida int,@CantidadNormalizada decimal(18,6)=NULL
```

### SP_PresentacionesProducto_Listar

```sql
CREATE   PROCEDURE dbo.SP_PresentacionesProducto_Listar
 @IdProducto int=NULL,@SoloActivos bit=0
```

### SP_PresentacionesProducto_ObtenerPorId

```sql
CREATE   PROCEDURE dbo.SP_PresentacionesProducto_ObtenerPorId
 @IdPresentacionProducto int
```

### SP_Producto_Actualizar

```sql
CREATE   PROCEDURE dbo.SP_Producto_Actualizar
 @IdProducto int,@Nombre nvarchar(150),@IdProductoBase int,@IdMarca int=NULL,@Categoria nvarchar(100)=NULL,@Descripcion nvarchar(250)=NULL,@CodigoInterno nvarchar(40)=NULL
```

### SP_Producto_Desactivar

```sql
CREATE   PROCEDURE dbo.SP_Producto_Desactivar
 @IdProducto int
```

### SP_Producto_Insertar

```sql
CREATE   PROCEDURE dbo.SP_Producto_Insertar
 @Nombre nvarchar(150),@IdProductoBase int,@IdMarca int=NULL,@Categoria nvarchar(100)=NULL,@Descripcion nvarchar(250)=NULL,@CodigoInterno nvarchar(40)=NULL
```

### SP_Producto_Listar

```sql
CREATE   PROCEDURE dbo.SP_Producto_Listar
 @SoloActivos bit=0,@Buscar nvarchar(150)=NULL,@IdProductoBase int=NULL,@IdMarca int=NULL
```

### SP_Producto_ObtenerPorId

```sql
CREATE   PROCEDURE dbo.SP_Producto_ObtenerPorId
 @IdProducto int
```

### SP_Productos_ListarParaDropdown

```sql
CREATE   PROCEDURE dbo.SP_Productos_ListarParaDropdown
```

### SP_ProformaProveedor_Insertar

```sql
CREATE   PROCEDURE dbo.SP_ProformaProveedor_Insertar
 @IdSolicitudCotizacionProveedor bigint,@IdDocumentoOrigen bigint,@IdImportacionDocumento bigint=NULL,@CabeceraJson nvarchar(max),@LineasJson nvarchar(max),@IdProformaProveedor int OUTPUT
```

### SP_ProformaProveedor_Listar

```sql
CREATE   PROCEDURE dbo.SP_ProformaProveedor_Listar
 @IdSolicitudCotizacion bigint=NULL,@IdProveedor int=NULL,@Estado varchar(30)=NULL,@Pagina int=1,@TamanoPagina int=50
```

### SP_ProformaProveedor_ObtenerPorId

```sql
CREATE   PROCEDURE dbo.SP_ProformaProveedor_ObtenerPorId
 @IdProformaProveedor int
```

### SP_ProformaProveedorDetalle_Insertar

```sql
CREATE   PROCEDURE dbo.SP_ProformaProveedorDetalle_Insertar
 @IdProformaProveedor int,@LineaJson nvarchar(max),@Motivo nvarchar(1000),@IdProformaProveedorDetalle int OUTPUT
```

### SP_ProformaProveedorDetalle_ListarPorProforma

```sql
CREATE   PROCEDURE dbo.SP_ProformaProveedorDetalle_ListarPorProforma
 @IdProformaProveedor int
```

### SP_Proveedor_Actualizar

```sql
CREATE   PROCEDURE dbo.SP_Proveedor_Actualizar
 @IdProveedor int,@Nombre nvarchar(150),@Contacto nvarchar(150)=NULL,@Telefono nvarchar(50)=NULL,@Correo nvarchar(150)=NULL,@Direccion nvarchar(250)=NULL,@Provincia nvarchar(100)=NULL,@Canton nvarchar(100)=NULL,@Distrito nvarchar(100)=NULL,@FuenteExterna nvarchar(100)=NULL,@IdExterno nvarchar(100)=NULL,@TipoIdentificacion nvarchar(30)=NULL,@IdentificacionFiscal nvarchar(50)=NULL,@PaisIdentificacion char(2)=NULL,@EsProveedorAutorizado bit=0,@FechaUltimaSincronizacion datetime2(7)=NULL
```

### SP_Proveedor_Desactivar

```sql
CREATE   PROCEDURE dbo.SP_Proveedor_Desactivar
 @IdProveedor int
```

### SP_Proveedor_Insertar

```sql
CREATE   PROCEDURE dbo.SP_Proveedor_Insertar
 @Nombre nvarchar(150),@Contacto nvarchar(150)=NULL,@Telefono nvarchar(50)=NULL,@Correo nvarchar(150)=NULL,@Direccion nvarchar(250)=NULL,@Provincia nvarchar(100)=NULL,@Canton nvarchar(100)=NULL,@Distrito nvarchar(100)=NULL,@FuenteExterna nvarchar(100)=NULL,@IdExterno nvarchar(100)=NULL,@TipoIdentificacion nvarchar(30)=NULL,@IdentificacionFiscal nvarchar(50)=NULL,@PaisIdentificacion char(2)=NULL,@EsProveedorAutorizado bit=0,@FechaUltimaSincronizacion datetime2(7)=NULL
```

### SP_Proveedor_Listar

```sql
CREATE   PROCEDURE dbo.SP_Proveedor_Listar
 @SoloActivos bit=0,@Buscar nvarchar(150)=NULL
```

### SP_Proveedor_ObtenerPorId

```sql
CREATE   PROCEDURE dbo.SP_Proveedor_ObtenerPorId
 @IdProveedor int
```

### SP_UnidadesMedida_ListarParaDropdown

```sql
CREATE   PROCEDURE dbo.SP_UnidadesMedida_ListarParaDropdown
```

### SP_UnidadMedida_Actualizar

```sql
CREATE   PROCEDURE dbo.SP_UnidadMedida_Actualizar
 @IdUnidadMedida int,@Codigo nvarchar(20),@Nombre nvarchar(50),@TipoBase nvarchar(20),@FactorConversion decimal(18,6),@EsUnidadBase bit
```

### SP_UnidadMedida_Desactivar

```sql
CREATE   PROCEDURE dbo.SP_UnidadMedida_Desactivar
 @IdUnidadMedida int
```

### SP_UnidadMedida_Insertar

```sql
CREATE   PROCEDURE dbo.SP_UnidadMedida_Insertar
 @Codigo nvarchar(20),@Nombre nvarchar(50),@TipoBase nvarchar(20),@FactorConversion decimal(18,6),@EsUnidadBase bit
```

### SP_UnidadMedida_Listar

```sql
CREATE   PROCEDURE dbo.SP_UnidadMedida_Listar
 @SoloActivos bit=0
```

### SP_UnidadMedida_ObtenerPorId

```sql
CREATE   PROCEDURE dbo.SP_UnidadMedida_ObtenerPorId
 @IdUnidadMedida int
```

### usp_Cotizaciones_CompararSolicitud

```sql
CREATE   PROCEDURE dbo.usp_Cotizaciones_CompararSolicitud
 @IdSolicitudCotizacion bigint,@Moneda varchar(10),@BaseTotalLinea varchar(30),@FechaReferencia date,
 @IncluirAlternativas bit=1,@IdSolicitudCotizacionDetalle bigint=NULL,@TipoBase nvarchar(20)=NULL
```

### usp_Documento_ObtenerPorId

```sql
CREATE   PROCEDURE dbo.usp_Documento_ObtenerPorId @IdDocumento bigint
```

### usp_Documento_Registrar

```sql
CREATE   PROCEDURE dbo.usp_Documento_Registrar
 @NombreOriginal nvarchar(255),@RutaAlmacenamiento nvarchar(800),@Sha256 varbinary(max),@TamanoBytes bigint,
 @Origen varchar(20),@VersionPlantilla nvarchar(40)=NULL,@IdDocumento bigint OUTPUT
```

### usp_Equivalencia_Actualizar

```sql
CREATE   PROCEDURE dbo.usp_Equivalencia_Actualizar
 @IdEquivalencia int,@CodigoProveedor nvarchar(100)=NULL,@DescripcionProveedor nvarchar(300),@IdProducto int,@IdPresentacionProducto int=NULL
```

### usp_Equivalencia_CambiarActivo

```sql
CREATE   PROCEDURE dbo.usp_Equivalencia_CambiarActivo @IdEquivalencia int,@Activo bit
```

### usp_Equivalencia_Listar

```sql
CREATE   PROCEDURE dbo.usp_Equivalencia_Listar @IdProveedor int,@SoloActivos bit=1
```

### usp_Importacion_ListarPorDocumento

```sql
CREATE   PROCEDURE dbo.usp_Importacion_ListarPorDocumento @IdDocumento bigint
```

### usp_Importacion_Registrar

```sql
CREATE   PROCEDURE dbo.usp_Importacion_Registrar
 @IdDocumento bigint,@VersionLector nvarchar(50),@Metodo varchar(20),@Estado varchar(30),
 @DatosExtraidosJson nvarchar(max)=NULL,@AdvertenciasJson nvarchar(max)=NULL,@IdImportacionDocumento bigint OUTPUT
```

### usp_Marca_Actualizar

```sql
CREATE   PROCEDURE dbo.usp_Marca_Actualizar
 @IdMarca int,@Nombre nvarchar(150)
```

### usp_Marca_CambiarActivo

```sql
CREATE   PROCEDURE dbo.usp_Marca_CambiarActivo
 @IdMarca int,@Activo bit
```

### usp_Marca_Insertar

```sql
CREATE   PROCEDURE dbo.usp_Marca_Insertar
 @Nombre nvarchar(150)
```

### usp_Marca_Listar

```sql
CREATE   PROCEDURE dbo.usp_Marca_Listar
 @SoloActivos bit=0,@Buscar nvarchar(150)=NULL
```

### usp_Marca_ObtenerPorId

```sql
CREATE   PROCEDURE dbo.usp_Marca_ObtenerPorId
 @IdMarca int
```

### usp_Producto_BuscarCandidatos

```sql
CREATE   PROCEDURE dbo.usp_Producto_BuscarCandidatos
 @Descripcion nvarchar(500),@IdProductoBase int=NULL,@IdMarca int=NULL
```

### usp_ProductoBase_Actualizar

```sql
CREATE   PROCEDURE dbo.usp_ProductoBase_Actualizar
 @IdProductoBase int,@Codigo nvarchar(40),@Nombre nvarchar(150),@FormulaDeclarada nvarchar(100)=NULL,@Descripcion nvarchar(500)=NULL,@ComparabilidadRevisada bit=0
```

### usp_ProductoBase_CambiarActivo

```sql
CREATE   PROCEDURE dbo.usp_ProductoBase_CambiarActivo
 @IdProductoBase int,@Activo bit
```

### usp_ProductoBase_Insertar

```sql
CREATE   PROCEDURE dbo.usp_ProductoBase_Insertar
 @Codigo nvarchar(40),@Nombre nvarchar(150),@FormulaDeclarada nvarchar(100)=NULL,@Descripcion nvarchar(500)=NULL,@ComparabilidadRevisada bit=0
```

### usp_ProductoBase_Listar

```sql
CREATE   PROCEDURE dbo.usp_ProductoBase_Listar
 @SoloActivos bit=0,@Buscar nvarchar(150)=NULL
```

### usp_ProductoBase_ObtenerPorId

```sql
CREATE   PROCEDURE dbo.usp_ProductoBase_ObtenerPorId
 @IdProductoBase int
```

### usp_Proforma_ActualizarCabecera

```sql
CREATE   PROCEDURE dbo.usp_Proforma_ActualizarCabecera
 @IdProformaProveedor int,@CabeceraJson nvarchar(max),@Motivo nvarchar(1000)
```

### usp_Proforma_ActualizarLinea

```sql
CREATE   PROCEDURE dbo.usp_Proforma_ActualizarLinea
 @IdProformaProveedorDetalle int,@LineaJson nvarchar(max),@Motivo nvarchar(1000)
```

### usp_Proforma_AgregarLinea

```sql
CREATE   PROCEDURE dbo.usp_Proforma_AgregarLinea
 @IdProformaProveedor int,@LineaJson nvarchar(max),@Motivo nvarchar(1000),@IdProformaProveedorDetalle int OUTPUT
```

### usp_Proforma_CancelarBorrador

```sql
CREATE   PROCEDURE dbo.usp_Proforma_CancelarBorrador
 @IdProformaProveedor int,@Motivo nvarchar(1000)
```

### usp_Proforma_ComprobarJson

```sql
CREATE   PROCEDURE dbo.usp_Proforma_ComprobarJson @CabeceraJson nvarchar(max)=NULL,@LineasJson nvarchar(max)=NULL
```

### usp_Proforma_Conciliar

```sql
CREATE   PROCEDURE dbo.usp_Proforma_Conciliar
 @IdProformaProveedor int,@EstadoConciliacion varchar(20),@Motivo nvarchar(1000),@Tolerancia decimal(18,4)=0.01
```

### usp_Proforma_CrearRevision

```sql
CREATE   PROCEDURE dbo.usp_Proforma_CrearRevision @IdProformaProveedor int,@IdNuevaProforma int OUTPUT
```

### usp_Proforma_GuardarBorrador

```sql
CREATE   PROCEDURE dbo.usp_Proforma_GuardarBorrador
 @IdSolicitudCotizacionProveedor bigint,
 @IdDocumentoOrigen bigint,
 @IdImportacionDocumento bigint=NULL,
 @CabeceraJson nvarchar(max),
 @LineasJson nvarchar(max),
 @IdProformaProveedor int OUTPUT
```

### usp_Proforma_HistorialCambios

```sql
CREATE   PROCEDURE dbo.usp_Proforma_HistorialCambios
 @IdProformaProveedor int
```

### usp_Proforma_ObtenerCompleta

```sql
CREATE   PROCEDURE dbo.usp_Proforma_ObtenerCompleta
 @IdProformaProveedor int
```

### usp_Proforma_RevisarLinea

```sql
CREATE   PROCEDURE dbo.usp_Proforma_RevisarLinea
 @IdProformaProveedorDetalle int,@Motivo nvarchar(1000)=NULL
```

### usp_Proforma_Validar

```sql
CREATE   PROCEDURE dbo.usp_Proforma_Validar @IdProformaProveedor int
```

### usp_Solicitud_CambiarEstado

```sql
CREATE   PROCEDURE dbo.usp_Solicitud_CambiarEstado @IdSolicitudCotizacion bigint,@Estado varchar(20)
```

### usp_Solicitud_CrearRevision

```sql
CREATE   PROCEDURE dbo.usp_Solicitud_CrearRevision @IdSolicitudCotizacion bigint,@IdNuevaSolicitud bigint OUTPUT
```

### usp_Solicitud_Emitir

```sql
CREATE   PROCEDURE dbo.usp_Solicitud_Emitir @IdSolicitudCotizacion bigint
```

### usp_Solicitud_GuardarBorrador

```sql
CREATE   PROCEDURE dbo.usp_Solicitud_GuardarBorrador
 @NumeroSolicitud nvarchar(50),@FechaSolicitud date,@FechaLimiteRespuesta date=NULL,
 @DatosClienteOriginalJson nvarchar(max)=NULL,@Observaciones nvarchar(2000)=NULL,
 @LineasJson nvarchar(max),@ProveedoresJson nvarchar(max),@IdSolicitudCotizacion bigint OUTPUT
```

### usp_Solicitud_Listar

```sql
CREATE   PROCEDURE dbo.usp_Solicitud_Listar
 @Estado varchar(20)=NULL,@Buscar nvarchar(50)=NULL,@Pagina int=1,@TamanoPagina int=50
```

### usp_Solicitud_ObtenerPorId

```sql
CREATE   PROCEDURE dbo.usp_Solicitud_ObtenerPorId @IdSolicitudCotizacion bigint
```

### usp_Solicitud_RegistrarEnvio

```sql
CREATE   PROCEDURE dbo.usp_Solicitud_RegistrarEnvio
 @IdSolicitudCotizacionProveedor bigint,@IdDocumentoEnviado bigint,@FechaEnvio datetime2(3)=NULL
```
