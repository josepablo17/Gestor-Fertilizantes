# Recepción y revisión de proformas

El cliente abre la solicitud emitida y selecciona al proveedor del que recibió la respuesta. El backend conserva el PDF exactamente como se recibió y crea una respuesta en borrador. Las respuestas validadas están disponibles para la [comparación por solicitud](Comparacion-de-cotizaciones.md). Los pasos de esta guía se pueden probar en Swagger; las pantallas siguen pendientes.

## Subir y consultar

- `POST /api/solicitudes-cotizacion/{idSolicitud}/destinatarios/{idDestinatario}/respuestas`: enviar el archivo en el campo `archivo` como `multipart/form-data`. Admite PDF legibles sin contraseña de hasta 10 MiB y 100 páginas. Devuelve 201 con la respuesta y su `Location`.
- `GET` en la misma ruta: lista las versiones del destinatario; admite `pagina` y `tamanoPagina` (hasta 200). SQL admite un borrador activo por destinatario. Para sustituirlo por otro archivo, cancelar el borrador y subir el archivo nuevo.
- `GET /api/respuestas-cotizacion/{idRespuesta}`: devuelve cabecera y renglones editables, metadatos del archivo, extracción original y cambios.
- `GET /api/respuestas-cotizacion/{idRespuesta}/documento`: descarga los bytes originales y verifica su SHA-256. Si no coinciden, devuelve un conflicto que pide restaurar el archivo.

Si el PDF conserva el formulario GF-SOL-1 o GF-SOL-2, el lector comprueba que la versión de la plantilla coincida con la registrada para el destinatario y coteja solicitud, versión, proveedor y renglones. Lee los valores de AcroForm. Si los identificadores contradicen la selección, rechaza la carga. Si no encuentra un formulario compatible (por ejemplo, una proforma propia, impresa o aplanada), conserva el archivo y deja los renglones solicitados listos para captura manual, sin precios ni cantidades ofrecidas.

La carga no valida la respuesta ni registra una compra. SQL actualiza el destinatario como respondido si ya había un envío registrado; una recepción nunca inventa una fecha de envío.

## Interpretar la extracción

- `importacion.camposOriginales` conserva los valores leídos como cadenas, incluso cuando no se pudieron interpretar. `importacion.advertencias` muestra qué campos requieren atención. Los datos de trabajo se devuelven en `cabecera` y `lineas`. Las correcciones no escriben en la extracción.
- GF-SOL-2 admite coma o punto decimal. GF-SOL-1 usa punto. Los formatos ambiguos, la precisión excesiva y las fechas inválidas quedan pendientes. Un cero escrito y válido se conserva como cero. Los ajustes opcionales vacíos de GF-SOL-2 equivalen a cero para el cálculo.
- El lector usa importes de una línea solo si está marcada `Cotizada`. Si contiene una observación, deja pendiente la asociación con la presentación, porque el proveedor pudo ofrecer otra. En GF-SOL-2, el servidor recalcula los totales a partir de los datos válidos y registra una advertencia si difieren del valor guardado en el PDF.
- Para archivos externos, el contenido visible lo interpreta quien revisa. No se usa OCR ni IA y no se intenta adivinar la estructura del proveedor.

## Corregir y validar

Las siguientes rutas son relativas a `/api/respuestas-cotizacion/{idRespuesta}`:

| Acción | Método y ruta | Cuerpo |
| --- | --- | --- |
| Corregir cabecera | `PUT /cabecera` | `motivo` y objeto completo `cabecera`. |
| Corregir línea | `PUT /lineas/{idLinea}` | `motivo` y objeto completo `linea`. |
| Agregar línea | `POST /lineas` | `motivo` y objeto `linea`, para ofertas adicionales o alternativas. |
| Confirmar una línea | `POST /lineas/{idLinea}/revision` | Acepta `{}`. La observación `motivo` es opcional y la acción queda registrada. |
| Conciliar importes | `POST /conciliacion` | `estadoConciliacion` (`Conciliada` o `ConDiferencias`). El `motivo` es obligatorio al aceptar diferencias y opcional si cuadra. La `tolerancia` es opcional (de 0 a 1; por defecto 0.01). |
| Finalizar la revisión | `POST /validacion` | Sin cuerpo. |
| Cancelar un borrador | `POST /cancelacion` | `motivo`. Conserva el historial y el archivo. |
| Revisar una versión finalizada | `POST /revisiones` | Sin cuerpo. Devuelve un nuevo borrador sobre el mismo archivo y extracción. |

Ejemplo de ajuste de línea solicitada; usar el identificador de la solicitud devuelto en `lineas[].idSolicitudDetalle`:

```json
{
  "motivo": "Transcribí el renglón 1 del documento del proveedor.",
  "linea": {
    "idSolicitudDetalle": 101,
    "numeroLinea": 1,
    "codigo": "001-1728",
    "descripcion": "Nitrato de calcio, saco de 25 kg",
    "tipoOferta": "Solicitada",
    "estadoOferta": "Cotizada",
    "cantidadEmpaques": 2,
    "precioUnitario": 7546.00,
    "totalLinea": 15092.00,
    "baseTotalLinea": "Bruto"
  }
}
```

Para una oferta solicitada, la presentación se toma de la copia de la solicitud. Una alternativa requiere que el renglón la permita, un `motivoAlternativa` y la selección explícita de una presentación de catálogo para completar la revisión. Una adicional no tiene `idSolicitudDetalle`. Se admite guardar una línea cotizada incompleta como borrador, pero para confirmarla deben constar número, descripción, presentación, cantidad, precio, total y base.

Guardar la cabecera conserva la conciliación cuando solo cambian datos de contacto, fechas u observaciones. Si cambian importes, se comprueban con una tolerancia de 0.01. Una cabecera completa que cuadra queda conciliada y una discrepancia o un importe faltante queda pendiente. Cambiar una moneda ya definida requiere una nueva comprobación. Corregir importes o moneda de una cabecera conciliada exige el motivo de la corrección.

Corregir una línea reinicia su confirmación y la conciliación. Para validar, completar fecha, moneda y los datos de ambas partes (`datosClienteOriginal`, `datosProveedorOriginal`), confirmar todos los renglones y comprobar los importes de cabecera. Declarar los ceros solo cuando corresponda. La conciliación controla `total = subtotal - descuento + iva + otrosCargos`.

El formulario muestra identificación e importes primero y agrupa las condiciones comerciales y los contactos en secciones opcionales. Completar nombres desde la solicitud requiere confirmar su coincidencia con el PDF. La comprobación manual se realiza con **Comprobar importes**. **Justificar diferencias** exige una explicación. La conciliación se consulta desde SQL al recargar o regresar desde la comparación.

La cabecera enumera los campos que faltan para validar y actualiza la lista mientras se edita. Un importe vacío sigue pendiente; un cero confirmado es válido. Número de proforma, vencimiento y datos de contacto permanecen opcionales. El resumen distingue los datos de cabecera, los renglones por revisar y la comprobación de importes; permite seguir guardando borradores incompletos. Los estados se presentan con etiquetas legibles, como **Pendiente de envío** y **En revisión**, conservando los valores del contrato de la API.

Al marcar `Conciliada`, la observación es opcional. SQL comprueba la cabecera dentro de la tolerancia indicada y registra la comprobación en el historial. Para aceptar `ConDiferencias` es obligatorio explicar la discrepancia.

Los PDF entrantes se guardan dentro de `Documentos__RutaRaiz`, junto a los archivos de salida, en una subcarpeta `recibidos` de cada destinatario. Respaldar toda la carpeta junto con SQL. El registro del documento, la extracción y el borrador se hace en una transacción SQL. Si la confirmación queda incierta, verificar en SQL antes de retirar el archivo del disco.
