import { consulta, solicitar } from "./cliente.js";

export const obtenerCompras = async (signal) =>
  (await solicitar("/Compra/ListarCompra", { decimalesExactos: false, signal })) ?? [];

export const obtenerCompraPorId = async (idCompra, signal) =>
  (await solicitar(`/Compra/ObtenerCompra/${idCompra}`, { signal })) ?? null;

export const insertarCompra = (compra) =>
  solicitar("/Compra/InsertarCompra", { metodo: "POST", datos: compra });

export const actualizarCompra = (compra) =>
  solicitar("/Compra/ActualizarCompra", { metodo: "PUT", datos: compra });

export async function obtenerUltimoPrecioCompra(filtros, signal) {
  try {
    return (await solicitar("/Compra/ObtenerUltimoPrecio" + consulta(filtros),
      { decimalesExactos: false, signal })) ?? null;
  } catch (error) {
    if (error.estadoHttp === 404) return null;
    throw error;
  }
}
