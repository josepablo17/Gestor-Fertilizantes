import { listarCatalogo } from "./catalogosApi.js";
import { solicitar } from "./cliente.js";

export const obtenerProductos = async (signal) => (await listarCatalogo("productos", undefined, signal)) ?? [];

export const desactivarProducto = (idProducto) =>
  solicitar(`/Producto/Desactivar/${idProducto}`, { metodo: "DELETE" });
