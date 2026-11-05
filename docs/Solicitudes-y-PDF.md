# Solicitudes de cotización y PDF rellenable

El cliente elige productos y presentaciones del catálogo e indica cuántos empaques desea cotizar. Crea un borrador, elige proveedores y emite la solicitud. Después descarga un PDF por proveedor para compartirlo por su canal habitual. El módulo de [recepción y revisión](Recepcion-y-revision-de-proformas.md) lee los campos cuando el proveedor devuelve el mismo formulario.

## Probar desde Swagger

Arrancar SQL con el DACPAC **1.0.2.0** y el backend según el README. Usar `/swagger` en Development. Antes de crear la solicitud, registrar un producto base, un producto comercial, una presentación y al menos un proveedor activo.

Las operaciones están en `/api/solicitudes-cotizacion`:

| Operación | Ruta relativa | Resultado |
| --- | --- | --- |
| Crear borrador | `POST /` | 201 con el recurso y su `Location`. |
| Listar / consultar | `GET /`, `GET /{id}` | Lista filtrable y paginada o solicitud con renglones y destinatarios. |
| Reemplazar borrador | `PUT /{id}/borrador` | Reemplaza todos los renglones y proveedores. Sus IDs pueden cambiar. |
| Emitir | `POST /{id}/emision` | Requiere nombre del cliente, renglones y proveedores. Congela los datos de los renglones. |
| Crear PDF | `POST /{id}/destinatarios/{dest}/documento` | 200 con metadatos, plantilla y SHA-256. Devuelve el mismo original al repetir. |
| Descargar | `GET /{id}/destinatarios/{dest}/documento` | Adjunto `application/pdf`. |
| Registrar envío | `POST /{id}/destinatarios/{dest}/envios` | Registra el envío real una vez. Acepta `{}` para usar la hora actual o `fechaEnvio` con zona horaria. |
| Crear revisión | `POST /{id}/revisiones` | 201 con un borrador de nueva versión, sin documentos ni envíos heredados. |
| Cerrar o cancelar | `PUT /{id}/estado` | Recibe `Cerrada` o `Cancelada` en la propiedad `estado`. |

Ejemplo de cuerpo para crear o reemplazar un borrador (sustituir los IDs por los de la base):

```json
{
  "numeroSolicitud": "SOL-2026-0001",
  "fechaSolicitud": "2026-11-05",
  "fechaLimiteRespuesta": "2026-11-12",
  "datosCliente": { "nombre": "Finca de ejemplo" },
  "lineas": [
    {
      "numeroLinea": 1,
      "idProducto": 12,
      "idPresentacionProducto": 21,
      "cantidadEmpaques": 6,
      "permiteAlternativas": true
    }
  ],
  "proveedores": [7, 8]
}
```

El máximo es de 100 renglones y 50 proveedores por solicitud. La cantidad expresa empaques (hasta cuatro decimales). SQL copia la presentación, el contenido, la unidad y los datos comerciales del catálogo. El nombre del proveedor en el PDF se toma al generar el original. Una vez generado, descargarlo o volver a solicitar su generación conserva los bytes originales y deja el envío pendiente hasta registrarlo explícitamente.

## Contrato del formulario GF-SOL-1

- Campos AcroForm ocultos de solo lectura: `gf_plantilla`, `gf_solicitud_id`, `gf_solicitud_version`, `gf_destinatario_id` y `gf_proveedor_id`. Cada renglón tiene `linea_{id}_id`. Los IDs se guardan como texto. En recepción deben verificarse contra SQL: los campos ocultos se pueden modificar fuera de un lector habitual.
- Los campos editables llevan el prefijo `cabecera_` o `linea_{id}_`. El proveedor indica número y vigencia de proforma, moneda, cantidad ofrecida, precio por empaque, descuento, impuesto, total y base del total por renglón, ajustes globales y condiciones. Los importes comienzan vacíos. Una alternativa se describe en la observación de su renglón.
- El PDF no calcula importes. En la futura comparación, usar la misma moneda y base de precio por kg o litro, con ajustes globales aparte. No convertir peso a volumen. Si el proveedor devuelve una proforma propia, el módulo de recepción la conserva para revisión manual.

## Almacenamiento local

`Documentos__RutaRaiz` permite apuntar a una carpeta persistente. Por defecto es `datos/documentos`, relativa a la raíz de contenido de la API. Mantenerla fuera de carpetas públicas, con escritura limitada a la cuenta de la aplicación. Respaldarla junto con SQL; la ruta registrada en SQL es relativa a esa carpeta.

El backend verifica el tamaño y SHA-256 antes de recuperar un original. Un archivo ausente, alterado o registrado con una ruta histórica fuera de este almacenamiento produce 409; restaurar el original compatible antes de reintentar. La transacción SQL registra metadatos y asignación de forma conjunta. Si una desconexión deja el resultado incierto, el archivo puede quedar en disco: verificar la referencia en SQL antes de retirarlo.

El generador fija [PDFsharp 6.2.4](https://www.nuget.org/packages/PDFsharp/6.2.4) (MIT). Las fuentes Liberation Sans se incluyen con su licencia SIL Open Font License 1.1 en la carpeta de fuentes del generador.
