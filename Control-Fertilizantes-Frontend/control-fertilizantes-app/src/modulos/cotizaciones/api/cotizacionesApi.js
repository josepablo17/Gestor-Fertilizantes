import { listarCatalogo, productosElegibles } from "../../../api/catalogosApi.js";
import { consulta, solicitar } from "../../../api/cliente.js";
import { idRuta } from "../../../utils/datosApi.js";

const solicitudes = "/solicitudes-cotizacion";
const solicitud = (id) => `${solicitudes}/${idRuta(id)}`;
const destinatario = (id, destino) => `${solicitud(id)}/destinatarios/${idRuta(destino)}`;
const respuesta = (id) => `/respuestas-cotizacion/${idRuta(id)}`;
const post = (ruta, datos) => solicitar(ruta, { metodo: "POST", datos });
const put = (ruta, datos) => solicitar(ruta, { metodo: "PUT", datos });

export async function cargarCatalogoCotizacion(signal) {
  const [productos, presentaciones, proveedores] = await Promise.all([
    productosElegibles(signal),
    listarCatalogo("presentaciones", { soloActivos: true }, signal),
    listarCatalogo("proveedores", { soloActivos: true }, signal),
  ]);
  const ids = new Set(productos.map((producto) => producto.idProducto));
  return { productos, presentaciones: presentaciones.filter((p) => ids.has(p.idProducto)), proveedores };
}

export const listarSolicitudes = (filtros, signal) => solicitar(solicitudes + consulta(filtros), { signal });
export const obtenerSolicitud = (id, signal) => solicitar(solicitud(id), { signal });
export const guardarSolicitud = (id, datos) => id ? put(`${solicitud(id)}/borrador`, datos) : post(solicitudes, datos);
export const emitirSolicitud = (id) => post(`${solicitud(id)}/emision`);
export const revisarSolicitud = (id) => post(`${solicitud(id)}/revisiones`);
export const cambiarEstadoSolicitud = (id, estado) => put(`${solicitud(id)}/estado`, { estado });
export const generarSolicitudPdf = (id, destino) => post(`${destinatario(id, destino)}/documento`);
export const descargarSolicitudPdf = (id, destino) => solicitar(`${destinatario(id, destino)}/documento`, { pdf: true });
export const registrarEnvio = (id, destino, datos = {}) => post(`${destinatario(id, destino)}/envios`, datos);
export const listarRespuestas = (id, destino, filtros, signal) =>
  solicitar(`${destinatario(id, destino)}/respuestas${consulta(filtros)}`, { signal });
export function recibirRespuesta(id, destino, archivo) {
  const datos = new FormData();
  datos.append("archivo", archivo);
  return post(`${destinatario(id, destino)}/respuestas`, datos);
}
export const obtenerRespuesta = (id, signal) => solicitar(respuesta(id), { signal });
export const descargarRespuestaPdf = (id, signal) => solicitar(`${respuesta(id)}/documento`, { pdf: true, signal });
export const ajustarCabecera = (id, datos) => put(`${respuesta(id)}/cabecera`, datos);
export const guardarLineaRespuesta = (id, linea, datos) =>
  linea ? put(`${respuesta(id)}/lineas/${linea}`, datos) : post(`${respuesta(id)}/lineas`, datos);
export const confirmarLinea = (id, linea, motivo) => post(`${respuesta(id)}/lineas/${linea}/revision`, { motivo });
export const conciliarRespuesta = (id, datos) => post(`${respuesta(id)}/conciliacion`, datos);
export const validarRespuesta = (id) => post(`${respuesta(id)}/validacion`);
export const cancelarRespuesta = (id, motivo) => post(`${respuesta(id)}/cancelacion`, { motivo });
export const revisarRespuesta = (id) => post(`${respuesta(id)}/revisiones`);
export const compararSolicitud = (id, filtros, signal) => solicitar(`${solicitud(id)}/comparacion${consulta(filtros)}`, { signal });
