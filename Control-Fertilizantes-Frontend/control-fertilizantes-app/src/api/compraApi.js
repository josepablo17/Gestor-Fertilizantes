import { consulta, solicitar } from "./cliente.js";

export const obtenerCompras = async (signal) =>
  (await solicitar("/Compra/ListarCompra", { decimalesExactos: false, signal })) ?? [];

export const obtenerCompraPorId = async (idCompra, signal) =>
  (await solicitar(`/Compra/ObtenerCompra/${idCompra}`, { decimalesExactos: false, signal })) ?? null;

export const insertarCompra = (compra) =>
  solicitar("/Compra/InsertarCompra", { metodo: "POST", datos: compra });

export const actualizarCompra = (compra) =>
  solicitar("/Compra/ActualizarCompra", { metodo: "PUT", datos: compra });

export const obtenerUltimoPrecioCompra = async (idProducto, idPresentacionProducto) =>
  (await solicitar("/Compra/ObtenerUltimoPrecio" + consulta({ idProducto, idPresentacionProducto }),
    { decimalesExactos: false })) ?? null;
