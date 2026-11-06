import { consulta, solicitar } from "./cliente.js";

const opcionesLectura = { decimalesExactos: false };

export async function obtenerComparativaProveedores({ idProducto, idPresentacionProducto, moneda, mesesAnalisis, soloAutorizados }) {
  const query = consulta({ idProducto, idPresentacionProducto, moneda, mesesAnalisis: mesesAnalisis || undefined, soloAutorizados });
  return (await solicitar("/ComparadorProveedor/Comparar" + query, opcionesLectura)) ?? [];
}

export async function obtenerDetalleProveedor({ idProducto, idPresentacionProducto, idProveedor, moneda, mesesAnalisis }) {
  const query = consulta({ idProducto, idPresentacionProducto, idProveedor, moneda, mesesAnalisis: mesesAnalisis || undefined });
  return (await solicitar("/ComparadorProveedor/DetalleProveedor" + query, opcionesLectura)) ?? null;
}
