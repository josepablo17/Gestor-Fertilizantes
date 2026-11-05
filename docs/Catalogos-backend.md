# Catálogos del backend

Esta etapa adapta los seis catálogos a los procedimientos existentes del DACPAC 1.0.1.0. No modifica tablas, procedimientos ni datos del entorno habitual. Se conservan las rutas anteriores; los cuerpos de productos y presentaciones cambian deliberadamente. El frontend anterior requiere adaptarse antes de usar estos formularios.

## Productos base y marcas

Nuevos controladores `ProductoBase` y `Marca`, cada uno con cinco rutas:

| Método | Ruta de ejemplo | Uso |
|---|---|---|
| GET | /api/ProductoBase/ListarProductoBase?soloActivos=true&buscar=MAP | Lista y búsqueda opcional, hasta 150 caracteres |
| GET | /api/ProductoBase/ObtenerProductoBase/1 | Consulta por ID |
| POST | /api/ProductoBase/InsertarProductoBase | Alta, HTTP 201 y Location |
| PUT | /api/ProductoBase/ActualizarProductoBase | Reemplazo de los campos editables, incluido idProductoBase |
| PUT | /api/ProductoBase/CambiarActivo/1 | Cuerpo {"activo":false} o {"activo":true} |

Para Marca se reemplaza ProductoBase por Marca en las rutas y se usa idMarca. Su entrada de alta contiene únicamente nombre. La entrada de actualización agrega idMarca. El estado exige una propiedad activo explícita; un objeto vacío se rechaza.

Ejemplo de producto base:

```json
{
  "codigo": "MAP",
  "nombre": "Fosfato monoamónico",
  "formulaDeclarada": "12-60-0",
  "descripcion": null,
  "comparabilidadRevisada": false
}
```

ComparabilidadRevisada es una decisión comercial explícita. La fórmula, el nombre o una coincidencia textual no la activan. Se puede cambiar mediante actualización del producto base; su valor predeterminado es false. Las actualizaciones son completas, no parches: incluir todos los campos que se quieran conservar.

## Productos comerciales

Crear en `/api/Producto/InsertarProducto`:

```json
{
  "nombre": "MAP marca comercial",
  "idProductoBase": 1,
  "idMarca": 1,
  "categoria": null,
  "descripcion": null,
  "codigoInterno": null
}
```

El producto base es obligatorio; la marca y la categoría son opcionales. SQL exige referencias activas. Ya no se recibe marca como texto ni se crea una marca implícitamente. Si se omite codigoInterno, SQL lo genera; al actualizar, null conserva el código existente. ActualizarProducto requiere además idProducto. Los restantes campos omitidos o vacíos opcionales se guardan como null.

Descripción admite hasta 250 caracteres; nombre 150, categoría 100 y código interno 40. No se mantienen reglas antiguas arbitrarias sobre mínimos de longitud o nombres numéricos.

ListarProducto acepta soloActivos, buscar, idProductoBase e idMarca. La salida conserva marca como etiqueta y agrega sus IDs, código interno, código/nombre del producto base, fórmula y estado de comparabilidad. La etiqueta se consulta desde la marca por ID.

## Presentaciones y unidades

Crear presentación en `/api/PresentacionProducto/InsertarPresentacionProducto`:

```json
{
  "idProducto": 1,
  "descripcion": "Saco de 25 kg",
  "cantidad": 25,
  "idUnidadMedida": 1
}
```

Cantidad es contenido por empaque, no cantidad de empaques solicitados. SQL calcula CantidadNormalizada con el factor de la unidad. No se recibe ese resultado en las entradas: enviar cantidadNormalizada se rechaza, en vez de confiar en un cálculo del navegador. Las salidas incluyen cantidad normalizada, dimensión, factor, código de unidad y contexto del producto/marca.

ListarPresentacionesProducto acepta idProducto y soloActivos. ListarProductosDropdown devuelve identidad de producto/base y marca, y SQL excluye productos con referencias inactivas. ListarUnidadesMedidaDropdown agrega código, dimensión, factor e indicador de unidad base.

Unidades mantiene sus rutas. TipoBase es obligatorio y se normaliza a PESO, VOLUMEN o UNIDAD; código se normaliza a mayúsculas. FactorConversion es positivo, con hasta seis decimales. EsUnidadBase exige factor 1. La base conserva las protecciones sobre unidades utilizadas y presentaciones históricas: una actualización incompatible produce 409. No se convierte entre dimensiones.

Los filtros soloActivos tienen la semántica de los procedimientos: productos filtra el estado propio; presentaciones exige también producto y unidad activos. Para seleccionar productos elegibles se usa el dropdown, que verifica además producto base y marca. Desactivar conserva los registros; una operación repetida permitida por SQL devuelve éxito. SQL impide desactivar unidades base o unidades con presentaciones activas.

## Proveedores

Solo nombre es obligatorio. Se agregan dirección, provincia, cantón, distrito, fuente externa, ID externo, fecha de última sincronización, tipo de identificación, identificación fiscal y país. Contacto, teléfono y correo son opcionales. La fecha de modificación nula permanece nula en las consultas.

La identidad fiscal se omite completa o incluye sus tres campos; país exige dos letras mayúsculas. Teléfono y correo se validan antes de SQL. Las restricciones SQL de unicidad siguen resolviendo duplicados como 409. ListarProveedor acepta soloActivos y buscar.

ActualizarProveedor reemplaza todos sus campos editables: enviar los datos opcionales existentes que se quieran conservar. No usar el formulario viejo para editar datos fiscales que ese formulario todavía no conoce.

## Validación y persistencia

Las entradas de los seis catálogos rechazan propiedades JSON desconocidas. Las validaciones se ejecutan tanto en HTTP como al llamar directamente al servicio. Campos obligatorios no admiten blancos; opcionales vacíos se normalizan a null. Las longitudes se verifican antes de enviar los parámetros.

Cantidad debe caber exactamente en decimal(18,4), y factor en decimal(18,6), ambos positivos. Se rechaza exceso de escala o rango en vez de redondear/truncar. Los parámetros Dapper declaran tipo, tamaño, precisión y escala. Texto y filtros se parametrizan; no se construye SQL con ellos.

Las clases Modelos/*Guardar contienen solo los campos normalizados para escribir. Se distinguen de DTOs HTTP y modelos de consulta, que incluyen IDs relacionados y etiquetas. El servicio valida y normaliza; SQL es la autoridad de referencias, estado, unicidad, normalización e historia. No se hace una consulta previa que pueda quedar obsoleta antes de escribir.

Errores: 400 para entradas/referencias inválidas, 404 para recurso inexistente y 409 para duplicados o protecciones de estado/historia. El middleware conserva mensajes públicos seguros.

## Compatibilidad y verificación

Los cuerpos antiguos que envían marca textual o cantidadNormalizada requieren migración. Las rutas se conservan y los cambios de OpenAPI se revisaron: diez rutas nuevas, ninguna retirada y ningún endpoint fuera de catálogos cambiado. La referencia actual publica 49 rutas y 42 esquemas, incluyendo salidas tipadas de catálogos.

```powershell
./scripts/Probar-Backend.ps1
./database/scripts/Invoke-DockerDatabase.ps1 -Action Test -VerifyBackend
```

El primer comando ejecuta pruebas de precisión, validación fiscal y contratos, dependencias de todos los controladores, arranque y HTTP sin SQL. El segundo crea su propia base/login/volumen, prueba SQL, persistencia y permisos, y ejecuta `scripts/Probar-CatalogosHttp.ps1` mediante la API real. El script de escrituras HTTP rechaza cualquier base que no sea la temporal de Compose. La instancia Windows original y el volumen habitual no se usan para estas pruebas.

Continúan pendientes solicitudes, documentos, recepción/revisión y comparación por solicitud, además de adaptar el frontend. Los contratos heredados de proformas y compra automática siguen documentados en Organizacion-backend.md.
