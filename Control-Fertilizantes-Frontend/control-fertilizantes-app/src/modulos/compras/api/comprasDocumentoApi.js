import { consulta, solicitar } from "../../../api/cliente.js";
import { idRuta } from "../../../utils/datosApi.js";

const ruta = "/compras-documento";
export const listarDocumentosCompra = (filtros, signal) => solicitar(ruta + consulta(filtros), { signal });
export const obtenerDocumentoCompra = (id, signal) => solicitar(`${ruta}/${idRuta(id)}`, { signal, cache: "no-store" });
export const registrarDocumentoCompra = (datos) => solicitar(ruta, { metodo: "POST", datos });
export const actualizarCabeceraCompra = (id, datos) => solicitar(`${ruta}/${idRuta(id)}/cabecera`, { metodo: "PUT", datos });
export const actualizarRenglonCompra = (id, idCompra, datos) =>
  solicitar(`${ruta}/${idRuta(id)}/renglones/${idRuta(idCompra)}`, { metodo: "PUT", datos });
