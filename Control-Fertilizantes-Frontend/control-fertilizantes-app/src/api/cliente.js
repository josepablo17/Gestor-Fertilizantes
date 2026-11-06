import CONFIG from "../config.js";
import { leerJson } from "../utils/datosApi.js";

export function consulta(parametros) {
  const query = new URLSearchParams();
  for (const [clave, valor] of Object.entries(parametros ?? {})) {
    if (valor != null && valor !== "") query.set(clave, String(valor));
  }
  return query.size ? `?${query}` : "";
}

export async function solicitar(ruta, { metodo = "GET", datos, signal, pdf = false } = {}) {
  const multipart = datos instanceof FormData;
  let respuesta;
  try {
    respuesta = await fetch(`${CONFIG.API_URL}${ruta}`, {
      method: metodo,
      signal,
      headers: datos !== undefined && !multipart ? { "Content-Type": "application/json" } : undefined,
      body: datos === undefined || multipart ? datos : JSON.stringify(datos),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("No se pudo conectar con el backend.");
  }

  if (pdf && respuesta.ok && respuesta.headers.get("content-type")?.startsWith("application/pdf")) {
    return respuesta.blob();
  }
  let resultado;
  try { resultado = leerJson(await respuesta.text()); } catch { /* El proxy puede responder sin JSON. */ }
  if (!respuesta.ok || !resultado?.exito || pdf) {
    throw new Error(resultado?.mensaje || `El servidor no devolvió la respuesta esperada (HTTP ${respuesta.status}).`);
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
