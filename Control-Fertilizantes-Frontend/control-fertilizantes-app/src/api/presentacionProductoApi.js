import { solicitar } from "./cliente.js";

export const obtenerPresentacionesProducto = async (signal) =>
  (await solicitar("/PresentacionProducto/ListarPresentacionesProducto", { decimalesExactos: false, signal })) ?? [];

export const desactivarPresentacionProducto = (idPresentacionProducto) =>
  solicitar(`/PresentacionProducto/Desactivar/${idPresentacionProducto}`, { metodo: "DELETE" });
