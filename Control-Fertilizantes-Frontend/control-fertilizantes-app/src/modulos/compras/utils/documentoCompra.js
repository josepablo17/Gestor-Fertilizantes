import { etiquetaPresentacion, listarCatalogo, productosElegibles } from "../../../api/catalogosApi.js";
import { decimalOpcional, enteroOpcional, textoOpcional } from "../../../utils/datosApi.js";
import { numeroEditable } from "../../../utils/numeros.js";
import { desdeDiezMilesimas, importeEnDiezMilesimas, importePositivo, prepararImputacion } from "../../presupuestos/utils/presupuesto.js";

export async function catalogosCompra(signal) {
  const [productos, presentaciones, proveedores] = await Promise.all([
    productosElegibles(signal), listarCatalogo("presentaciones", { soloActivos: true }, signal),
    listarCatalogo("proveedores", { soloActivos: true }, signal),
  ]);
  return { productos, presentaciones, proveedores };
}

export const opcionesPresentacion = (catalogos, idProducto) => catalogos.presentaciones
  .filter((p) => String(p.idProducto) === String(idProducto))
  .map((p) => ({ value: p.idPresentacionProducto, label: etiquetaPresentacion(p) }));

export function valoresRenglon(compra = {}) {
  return {
    clave: crypto.randomUUID(), idCompra: compra.idCompra, idProducto: compra.idProducto ?? "",
    idPresentacionProducto: compra.idPresentacionProducto ?? "", cantidadComprada: numeroEditable(compra.cantidadComprada),
    precioTotal: numeroEditable(compra.precioTotal), observaciones: compra.observaciones ?? "", imputacion: null,
  };
}

export function cuerpoCabeceraCompra(datos) {
  if (!datos.idProveedor || !datos.fechaCompra || !datos.moneda) throw new Error("Completa proveedor, fecha y moneda.");
  return {
    idProveedor: enteroOpcional(datos.idProveedor), fechaCompra: datos.fechaCompra.slice(0, 10), moneda: datos.moneda,
    numeroFactura: textoOpcional(datos.numeroFactura), observaciones: textoOpcional(datos.observaciones),
  };
}

export function cuerpoRenglonCompra(datos) {
  if (!datos.idProducto || !datos.idPresentacionProducto) throw new Error("Selecciona producto y presentación en cada renglón.");
  const cantidad = decimalOpcional(datos.cantidadComprada, 0, true);
  if (cantidad === null) throw new Error("Indica la cantidad de empaques de cada producto.");
  return {
    idProducto: enteroOpcional(datos.idProducto), idPresentacionProducto: enteroOpcional(datos.idPresentacionProducto),
    cantidadComprada: cantidad, precioTotal: importePositivo(datos.precioTotal), observaciones: textoOpcional(datos.observaciones),
  };
}

export function criteriosImputacionCompra(cabecera, linea) {
  return JSON.stringify([cabecera.idProveedor, cabecera.fechaCompra, cabecera.moneda, linea.idProducto, linea.idPresentacionProducto]);
}

export function prepararDocumentoCompra(cabecera, lineas) {
  if (lineas.length < 1 || lineas.length > 100) throw new Error("Agrega entre 1 y 100 productos a la compra.");
  return {
    ...cuerpoCabeceraCompra(cabecera),
    lineas: lineas.map((linea, indice) => {
      try {
        const datos = cuerpoRenglonCompra(linea);
        if (linea.imputacion && linea.imputacion.criterios !== criteriosImputacionCompra(cabecera, linea))
          throw new Error("Cambiaron los datos del producto o de la cabecera. Revisa su distribución presupuestaria.");
        return { ...datos, imputacionPresupuesto: linea.imputacion ? prepararImputacion(linea.imputacion.datos, datos.precioTotal) : null };
      } catch (error) { throw new Error(`Renglón ${indice + 1}: ${error.message}`); }
    }),
  };
}

export function totalDocumentoCompra(lineas) {
  try {
    return desdeDiezMilesimas(lineas.reduce((total, linea) => total + importeEnDiezMilesimas(importePositivo(linea.precioTotal)), 0n));
  } catch { return null; }
}
