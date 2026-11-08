import CONFIG from "../config.js";
import { leerJson } from "../utils/datosApi.js";

export function consulta(parametros) {
  const query = new URLSearchParams();
  for (const [clave, valor] of Object.entries(parametros ?? {})) {
    if (valor != null && valor !== "") query.set(clave, String(valor));
  }
  return query.size ? `?${query}` : "";
}

export class ErrorApi extends Error {
  constructor(mensaje, estadoHttp = null) {
    super(mensaje);
    this.name = "ErrorApi";
    this.estadoHttp = estadoHttp;
  }
}

export async function solicitar(ruta, { metodo = "GET", datos, signal, pdf = false, decimalesExactos = true, cache } = {}) {
  const multipart = datos instanceof FormData;
  let respuesta;
  try {
    respuesta = await fetch(`${CONFIG.API_URL}${ruta}`, {
      method: metodo,
      signal,
      cache,
      headers: datos !== undefined && !multipart ? { "Content-Type": "application/json" } : undefined,
      body: datos === undefined || multipart ? datos : JSON.stringify(datos),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ErrorApi("No se pudo conectar con el backend.");
  }

  if (pdf && respuesta.ok && respuesta.headers.get("content-type")?.startsWith("application/pdf")) {
    return respuesta.blob();
  }
  const texto = await respuesta.text();
  let resultado;
  try { resultado = decimalesExactos ? leerJson(texto) : JSON.parse(texto); } catch { /* El proxy puede responder sin JSON. */ }
  if (!respuesta.ok || !resultado?.exito || pdf) {
    throw new ErrorApi(
      resultado?.mensaje || `El servidor no devolvió la respuesta esperada (HTTP ${respuesta.status}).`,
      respuesta.status
    );
  }
  return resultado.data;
}

export function descargarArchivo(archivo, nombre) {
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
