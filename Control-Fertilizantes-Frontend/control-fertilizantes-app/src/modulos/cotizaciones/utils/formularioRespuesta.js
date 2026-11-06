import { decimalOpcional, enteroOpcional, idRuta, textoOpcional } from "../../../utils/datosApi.js";
import { numeroEditable } from "../../../utils/numeros.js";

export const basesImporte = [
  { value: "Bruto", label: "Bruto (antes de descuentos e impuestos)" },
  { value: "NetoSinImpuestos", label: "Neto sin impuestos" },
  { value: "ConImpuestos", label: "Con impuestos" },
];

export const camposCabecera = [
  ["numeroProforma", "Número de proforma", 50],
  ["fechaProforma", "Fecha de proforma", undefined, "date"],
  ["fechaVencimiento", "Fecha de vencimiento", undefined, "date"],
  ["moneda", "Moneda (ej. CRC)", 3],
  ["diasCredito", "Días de crédito", undefined, "entero"],
  ["tipoDocumento", "Tipo de documento", 50],
  ["nombreProveedorPdf", "Nombre del proveedor en el PDF", 200],
  ["nombreNegocio", "Nombre del negocio", 250],
  ["razonSocial", "Razón social", 250],
  ["cedula", "Cédula", 50],
  ["telefono", "Teléfono", 50, "tel"],
  ["vendedor", "Vendedor", 150],
  ["subtotal", "Subtotal", undefined, "decimal"],
  ["descuento", "Descuento global", undefined, "decimal"],
  ["iva", "IVA global", undefined, "decimal"],
  ["otrosCargos", "Otros cargos o transporte", undefined, "decimal"],
  ["total", "Total del documento", undefined, "decimal"],
  ["condicionesPago", "Condiciones de pago", 1000, "largo"],
  ["condicionesEntrega", "Condiciones de entrega", 1000, "largo"],
  ["observaciones", "Observaciones de la proforma", 2000, "largo"],
];

export const partesCabecera = [
  ["datosClienteOriginal", "Cliente según el documento"],
  ["datosProveedorOriginal", "Proveedor según el documento"],
];

export const camposParte = [
  ["nombre", "Nombre", 150],
  ["identificacion", "Identificación", 100],
  ["direccion", "Dirección", 500],
  ["telefono", "Teléfono", 50, "tel"],
  ["correo", "Correo", 150],
];

export function valoresCabecera(cabecera) {
  const datos = Object.fromEntries(camposCabecera.map(([campo, , , tipo]) => [
    campo, tipo === "decimal" ? numeroEditable(cabecera[campo]) : cabecera[campo] ?? "",
  ]));
  for (const [campo] of partesCabecera) datos[campo] = { ...(cabecera[campo] ?? {}) };
  return datos;
}

export function cuerpoCabecera(valores) {
  const datos = Object.fromEntries(camposCabecera.map(([campo, , , tipo]) => [
    campo,
    tipo === "decimal" ? decimalOpcional(valores[campo], 4)
      : tipo === "entero" ? enteroOpcional(valores[campo])
      : textoOpcional(campo === "moneda" ? String(valores[campo]).toUpperCase() : valores[campo]),
  ]));
  for (const [campo] of partesCabecera) {
    const parte = { ...valores[campo] };
    for (const [llave] of camposParte) {
      if (!Object.hasOwn(parte, llave)) continue;
      const texto = textoOpcional(parte[llave]);
      if (texto === null) delete parte[llave];
      else parte[llave] = texto;
    }
    datos[campo] = Object.keys(parte).length ? parte : null;
  }
  return datos;
}

export const importesLinea = [
  ["cantidadEmpaques", "Empaques ofrecidos", 4, true],
  ["precioUnitario", "Precio por empaque", 6],
  ["descuentoPorcentaje", "Descuento de línea (%)", 2],
  ["descuentoMonto", "Monto del descuento de línea", 4],
  ["impuestoMonto", "Impuesto de línea", 4],
  ["totalLinea", "Total de línea", 4],
];

export function valoresLinea(linea) {
  return {
    idSolicitudDetalle: linea?.idSolicitudDetalle ?? "",
    numeroLinea: linea?.numeroLinea ?? "",
    idPresentacionProducto: linea?.idPresentacionProducto ?? "",
    codigo: linea?.codigo ?? "",
    descripcion: linea?.descripcion ?? "",
    tipoOferta: linea?.tipoOferta ?? "Adicional",
    estadoOferta: linea?.estadoOferta ?? "SinCotizar",
    baseTotalLinea: linea?.baseTotalLinea ?? "SinDefinir",
    motivoAlternativa: linea?.motivoAlternativa ?? "",
    observacion: linea?.observacion ?? "",
    ...Object.fromEntries(importesLinea.map(([campo]) => [campo, numeroEditable(linea?.[campo])])),
  };
}

export function cuerpoLinea(valores) {
  const cotizada = valores.estadoOferta === "Cotizada";
  const numeroLinea = enteroOpcional(valores.numeroLinea);
  if (numeroLinea === 0) throw new Error("El número de renglón debe ser mayor que cero.");
  return {
    idSolicitudDetalle: valores.tipoOferta === "Adicional" || !valores.idSolicitudDetalle
      ? null : idRuta(valores.idSolicitudDetalle),
    numeroLinea,
    idPresentacionProducto: valores.tipoOferta !== "Solicitada" && cotizada
      ? enteroOpcional(valores.idPresentacionProducto) : null,
    codigo: textoOpcional(valores.codigo),
    descripcion: textoOpcional(valores.descripcion),
    tipoOferta: valores.tipoOferta,
    estadoOferta: valores.estadoOferta,
    baseTotalLinea: cotizada ? valores.baseTotalLinea : "SinDefinir",
    motivoAlternativa: valores.tipoOferta === "Alternativa" ? textoOpcional(valores.motivoAlternativa) : null,
    observacion: textoOpcional(valores.observacion),
    ...Object.fromEntries(importesLinea.map(([campo, , escala, positivo]) => [
      campo, cotizada ? decimalOpcional(valores[campo], escala, positivo) : null,
    ])),
  };
}
