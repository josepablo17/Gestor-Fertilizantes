import { decimalOpcional, enteroOpcional, fechaLocal, textoOpcional } from "../../../utils/datosApi.js";
import { numeroEditable } from "../../../utils/numeros.js";

export const camposCliente = [
  ["nombre", "Nombre del cliente", 150],
  ["identificacion", "Identificación", 100],
  ["direccion", "Dirección", 500],
  ["telefono", "Teléfono", 50, "tel"],
  ["correo", "Correo", 150, "email"],
];

export function nuevaLineaSolicitud(clave) {
  return { clave, idProducto: "", idPresentacionProducto: "", cantidadEmpaques: "", permiteAlternativas: true, observaciones: "" };
}

export function valoresSolicitud(original) {
  return {
    fechaSolicitud: original?.fechaSolicitud ?? fechaLocal(),
    fechaLimiteRespuesta: original?.fechaLimiteRespuesta ?? "",
    observaciones: original?.observaciones ?? "",
    cliente: Object.fromEntries(camposCliente.map(([campo]) => [campo, original?.datosCliente?.[campo] ?? ""])),
    lineas: (original?.lineas ?? []).map((linea) => ({
      clave: `guardada-${linea.idSolicitudCotizacionDetalle}`,
      idProducto: linea.idProducto,
      idPresentacionProducto: linea.idPresentacionProducto,
      cantidadEmpaques: numeroEditable(linea.cantidadEmpaquesSolicitada),
      permiteAlternativas: linea.permiteAlternativas,
      observaciones: linea.observaciones ?? "",
      etiquetaProducto: linea.nombreProductoOriginal,
      etiquetaPresentacion: linea.presentacionOriginal,
    })),
    proveedores: (original?.destinatarios ?? []).map((destino) => destino.idProveedor),
  };
}

export function cuerpoSolicitud(valores) {
  const cliente = Object.fromEntries(camposCliente.map(([campo]) => [campo, textoOpcional(valores.cliente[campo])]));
  if (!cliente.nombre && Object.values(cliente).some(Boolean)) {
    throw new Error("Completa el nombre del cliente o deja en blanco sus datos.");
  }
  if (valores.fechaLimiteRespuesta && valores.fechaLimiteRespuesta < valores.fechaSolicitud) {
    throw new Error("La fecha límite no puede ser anterior a la fecha de solicitud.");
  }
  return {
    fechaSolicitud: valores.fechaSolicitud,
    fechaLimiteRespuesta: textoOpcional(valores.fechaLimiteRespuesta),
    datosCliente: cliente.nombre ? cliente : null,
    observaciones: textoOpcional(valores.observaciones),
    lineas: valores.lineas.map((linea, indice) => ({
      numeroLinea: indice + 1,
      idProducto: enteroOpcional(linea.idProducto),
      idPresentacionProducto: enteroOpcional(linea.idPresentacionProducto),
      cantidadEmpaques: decimalOpcional(linea.cantidadEmpaques, 4, true),
      permiteAlternativas: linea.permiteAlternativas,
      observaciones: textoOpcional(linea.observaciones),
    })),
    proveedores: valores.proveedores.map(enteroOpcional),
  };
}
