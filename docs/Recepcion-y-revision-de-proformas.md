# Recepción y revisión de proformas

El cliente abre la solicitud emitida y selecciona al proveedor del que recibió la respuesta. El backend conserva el PDF exactamente como se recibió y crea una respuesta en borrador. La comparación por solicitud y las pantallas para este flujo se implementan en etapas posteriores. Los pasos de esta guía se pueden probar en Swagger.

## Subir y consultar

- `POST /api/solicitudes-cotizacion/{idSolicitud}/destinatarios/{idDestinatario}/respuestas`: enviar el archivo en el campo `archivo` como `multipart/form-data`. Admite PDF legibles sin contraseña de hasta 10 MiB y 100 páginas. Devuelve 201 con la respuesta y su `Location`.
- `GET` en la misma ruta: lista las versiones del destinatario; admite `pagina` y `tamanoPagina` (hasta 200). SQL admite un borrador activo por destinatario. Para sustituirlo por otro archivo, cancelar el borrador y subir el archivo nuevo.
- `GET /api/respuestas-cotizacion/{idRespuesta}`: devuelve cabecera y renglones editables, metadatos del archivo, extracción original y cambios.
- `GET /api/respuestas-cotizacion/{idRespuesta}/documento`: descarga los bytes originales y verifica su SHA-256. Si no coinciden, devuelve un conflicto que pide restaurar el archivo.

Si el PDF conserva el formulario GF-SOL-1, el lector comprueba que exista una plantilla original registrada para el destinatario y coteja solicitud, versión, proveedor y renglones. Lee los valores de AcroForm. Si los identificadores contradicen la selección, rechaza la carga. Si no encuentra un formulario compatible (por ejemplo, una proforma propia, impresa o aplanada), conserva el archivo y deja los renglones solicitados listos para captura manual, sin precios ni cantidades ofrecidas.

La carga no valida la respuesta ni registra una compra. SQL actualiza el destinatario como respondido si ya había un envío registrado; una recepción nunca inventa una fecha de envío.

## Interpretar la extracción

- `importacion.camposOriginales` conserva los valores leídos como cadenas, incluso cuando no se pudieron interpretar. `importacion.advertencias` muestra qué campos requieren atención. Los datos de trabajo se devuelven en `cabecera` y `lineas`. Las correcciones no escriben en la extracción.
- Los campos vacíos siguen siendo nulos. Para importes automáticos, usar punto decimal y omitir símbolos y separadores de miles. Los formatos ambiguos, la precisión excesiva y las fechas inválidas quedan pendientes. Un cero escrito y válido se conserva como cero.
- El lector usa importes de una línea solo si está marcada `Cotizada`. Si contiene una observación, deja pendiente la asociación con la presentación, porque el proveedor pudo ofrecer otra. Las alternativas se resuelven explícitamente; el lector no adivina equivalencias ni calcula descuentos, impuestos o totales.
- Para archivos externos, el contenido visible lo interpreta quien revisa. No se usa OCR ni IA y no se intenta adivinar la estructura del proveedor.

## Corregir y validar

Las siguientes rutas son relativas a `/api/respuestas-cotizacion/{idRespuesta}`:

| Acción | Método y ruta | Cuerpo |
| --- | --- | --- |
| Corregir cabecera | `PUT /cabecera` | `motivo` y objeto completo `cabecera`. |
| Corregir línea | `PUT /lineas/{idLinea}` | `motivo` y objeto completo `linea`. |
| Agregar línea | `POST /lineas` | `motivo` y objeto `linea`, para ofertas adicionales o alternativas. |
| Confirmar una línea | `POST /lineas/{idLinea}/revision` | `motivo`. |
| Conciliar importes | `POST /conciliacion` | `estadoConciliacion` (`Conciliada` o `ConDiferencias`), `motivo` y `tolerancia` opcional (de 0 a 1; por defecto 0.01). |
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

Corregir cualquier dato de cabecera o de línea reinicia la conciliación. Corregir una línea también reinicia su confirmación. Para validar, completar fecha, moneda y los datos de ambas partes (`datosClienteOriginal`, `datosProveedorOriginal`), confirmar todos los renglones y conciliar los importes de cabecera. Declarar los ceros solo cuando corresponda. La conciliación controla `total = subtotal - descuento + iva + otrosCargos` y no reparte ajustes globales entre líneas.

Los PDF entrantes se guardan dentro de `Documentos__RutaRaiz`, junto a los archivos de salida, en una subcarpeta `recibidos` de cada destinatario. Respaldar toda la carpeta junto con SQL. El registro del documento, la extracción y el borrador se hace en una transacción SQL. Si la confirmación queda incierta, verificar en SQL antes de retirar el archivo del disco.
