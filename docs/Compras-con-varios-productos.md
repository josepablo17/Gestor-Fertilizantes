# Compras con varios productos

En **Compras → Registrar compra**, seleccionar proveedor, fecha y moneda una vez. El número interno `COM-000001` se asigna automáticamente. El número de factura y las observaciones son opcionales. Agregar de uno a cien renglones con producto, presentación, empaques enteros e importe final de cada renglón. El precio por empaque y el total de la compra se calculan con esos importes; los descuentos, impuestos o transportes aplicables deben estar reflejados en los importes capturados. No se interpreta este registro como un generador fiscal de facturas.

Cada renglón puede distribuirse entre partidas presupuestarias y fincas, utilizando compromisos compatibles. Su distribución debe sumar exactamente su importe. La cabecera, todos los renglones y sus distribuciones se guardan en una transacción: si un producto o una imputación falla, no se conserva una compra parcial. El identificador de operación evita duplicar la compra o el gasto al reintentar el mismo envío.

El listado muestra una fila por compra y busca por número, proveedor, factura o producto. Abrir una compra permite consultar todos sus productos, editar los datos generales o un renglón, y consultar o revertir la distribución presupuestaria de cada producto. Se abre un editor a la vez. Si otra pantalla modificó la compra, la versión enviada se rechaza con 409 y es necesario recargar para editar sobre los datos actuales. Cambiar un importe o producto ya imputado requiere revertir su distribución; cambiar proveedor, fecha o moneda requiere revertir las distribuciones activas de todos los renglones afectados.

## Modelo y compatibilidad

- `ComprasCabecera` guarda proveedor, fecha, moneda, factura, observaciones, control de operación y versión.
- `Compras` conserva los identificadores existentes y representa los renglones. Se añaden `IdCompraCabecera` y `NumeroLinea`, su llave foránea y un índice único por cabecera/renglón. Así se conservan las relaciones presupuestarias y las referencias históricas de precios.
- El postdespliegue crea una cabecera individual por registro antiguo, sin intentar deducir facturas por fecha o proveedor. La migración puede reaplicarse y conserva los importes y los identificadores originales. Los enlaces históricos de edición siguen funcionando y enlazan a la compra completa.
- `SP_Compra_Insertar` continúa disponible para consumidores antiguos y crea una cabecera de un renglón. Los cambios de datos comunes de una compra con varios renglones se realizan mediante su cabecera completa.

## API

| Acción | Ruta |
| --- | --- |
| Listar documentos, con búsqueda y paginación | `GET /api/compras-documento?busqueda=&moneda=&fecha=&pagina=1&tamanoPagina=20` |
| Consultar compra y productos | `GET /api/compras-documento/{id}` |
| Registrar compra completa | `POST /api/compras-documento` |
| Editar datos comunes | `PUT /api/compras-documento/{id}/cabecera` |
| Editar un producto | `PUT /api/compras-documento/{id}/renglones/{idCompra}` |

La creación recibe `idOperacion`, `idProveedor`, `fechaCompra`, `moneda`, `numeroFactura`, `observaciones` y `lineas`. Cada línea contiene `idProducto`, `idPresentacionProducto`, `cantidadComprada`, `precioTotal`, `observaciones` e `imputacionPresupuesto` opcional. Las imputaciones conservan `distribucion`, `motivo` y `motivoExceso`; SQL deriva un identificador estable por renglón a partir de la operación del documento. La edición de cabecera o renglón exige la `version` Base64 devuelta por la consulta. Los importes admiten hasta cuatro decimales y se conservan exactos; en pantalla se presenta como máximo uno.

## Aplicación de la actualización

Aplicar el DACPAC antes de iniciar la API y el frontend nuevos. Desde la raíz del repositorio, `./database/scripts/Invoke-DockerDatabase.ps1 -Action Up` actualiza la base local de Docker, migra las compras existentes y conserva el volumen. También puede publicarse el DACPAC mediante el flujo SQL habitual. Esta actualización no requiere borrar compras ni presupuestos.
