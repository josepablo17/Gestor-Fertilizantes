import { listarCatalogo } from "./catalogosApi.js";
import { solicitar } from "./cliente.js";

export const obtenerProveedores = async (signal) => (await listarCatalogo("proveedores", undefined, signal)) ?? [];

export const desactivarProveedor = (idProveedor) =>
  solicitar(`/Proveedor/Desactivar/${idProveedor}`, { metodo: "DELETE" });
