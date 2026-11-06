import { consulta, solicitar } from "./cliente.js";

const opcionesLectura = { decimalesExactos: false };

export const obtenerHistorialPrecios = async (idProducto, idPresentacionProducto) =>
  (await solicitar("/CompraInteligencia/HistorialPrecios" + consulta({ idProducto, idPresentacionProducto }),
    opcionesLectura)) ?? [];

async function obtenerDatoOpcional(ruta) {
  try {
    return (await solicitar(ruta, opcionesLectura)) ?? null;
  } catch (error) {
    if (error.estadoHttp === 404) return null;
    throw error;
  }
}

export const obtenerResumenInteligentePrecios = (idProducto, idPresentacionProducto) =>
  obtenerDatoOpcional("/CompraInteligencia/ResumenInteligentePrecios" + consulta({ idProducto, idPresentacionProducto }));

export const evaluarCompra = (idCompra) =>
  obtenerDatoOpcional(`/CompraInteligencia/EvaluarCompra/${idCompra}`);

export const obtenerAlertasCompra = async (idProducto, idPresentacionProducto) =>
  (await solicitar("/CompraInteligencia/Alertas" + consulta({ idProducto, idPresentacionProducto }),
    opcionesLectura)) ?? [];
