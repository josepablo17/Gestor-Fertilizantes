# Comparación de cotizaciones por solicitud

En Swagger, consulta una solicitud que ya tenga respuestas validadas:

```http
GET /api/solicitudes-cotizacion/42/comparacion?moneda=CRC&baseTotalLinea=NetoSinImpuestos&fechaReferencia=2026-11-05
```

Los tres filtros del ejemplo son obligatorios. La moneda se indica con tres letras mayúsculas; la base del total puede ser `Bruto`, `NetoSinImpuestos` o `ConImpuestos`. La fecha (`AAAA-MM-DD`) decide la vigencia, incluido el día del vencimiento. La consulta usa las versiones validadas actuales; la fecha no reconstruye versiones históricas.

Para acotar el resultado, puedes indicar `tipoBase=PESO` o `tipoBase=VOLUMEN`, `idSolicitudCotizacionDetalle` y `incluirAlternativas=false`. Las alternativas se incluyen por defecto si son comparables. `UNIDAD` también se admite para renglones que el catálogo mide por piezas. Un criterio inválido o un renglón ajeno produce 400; una solicitud inexistente, 404.

## Leer el resultado

| Dato | Cómo interpretarlo |
| --- | --- |
| `lineas[].unidadBase` | KG, L o UND según el renglón solicitado. No se convierte entre dimensiones. |
| `ofertas[].precioPorUnidadBase` | Total de la línea dividido por el contenido ofrecido en esa unidad. El precio por empaque se muestra por separado. |
| `lineas[].menorPrecioPorUnidadBase` | Menor precio entre ofertas comparables de ese renglón. Puede incluir ofertas parciales o vencidas. |
| `lineas[].menorPrecioConCoberturaYVigencia` | Menor precio comparable que cubre lo pedido y tiene vencimiento conocido vigente. Queda nulo si no hay ninguna. |
| `lineas[].ultimaCompra` | Último precio pagado por unidad base para el producto y la presentación solicitados, en la misma moneda y hasta la fecha de referencia. Incluye el proveedor, la fecha y el identificador de la compra. Queda nulo cuando falta historial. |
| `ofertas[].condicionComparacion` | Explica por qué se compara o se excluye: por ejemplo, moneda o base distinta, sin respuesta validada o sin disponibilidad. |
| `documentos[]` | Una entrada por proforma validada representada en el resultado. Se vincula con `ofertas[].idProformaProveedor`. |

Los empates permanecen marcados en las ofertas. Una respuesta nueva pendiente no desplaza a la última validada. Una proforma en otra moneda o base sigue visible para consultar sus condiciones, con precio normalizado nulo. Las líneas adicionales sin vínculo con lo solicitado se consultan en el detalle de la proforma. Un importe normalizado no representable se señala como `PrecioNoRepresentable`; no participa en el mínimo.

La referencia histórica se muestra aparte. El registro de compras conserva el importe pagado, cuya base fiscal no está registrada, y el valor histórico queda fuera del ranking de ofertas.

Por ejemplo, una oferta de **2 sacos de 25 kg** con total de línea de **₡200** equivale a **₡4/kg**. Otra de **9 bolsas de 10 kg** con total de **₡270** equivale a **₡3/kg**. Si se solicitaron **81,25 kg**, solo la segunda cubre la cantidad. Los cargos globales pueden influir en la decisión, pero aparecen en `documentos[].ajustesGlobales` junto con las condiciones y el total del documento. No se distribuyen entre renglones ni se suman al precio por kg o litro.

El endpoint consulta el DACPAC 1.0.2.0 con los procedimientos existentes. La comparación es de solo lectura y no registra compras.
