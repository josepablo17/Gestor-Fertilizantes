export function leerJson(texto) {
  return JSON.parse(texto, (clave, valor, contexto) => {
    if (typeof valor !== "number") return valor;
    // Los IDs bigint y los importes no deben redondearse al editar o construir una ruta.
    const decimal = /[.eE]/.test(contexto?.source ?? "");
    if (!Number.isSafeInteger(valor) || decimal) {
      if (contexto?.source) return contexto.source;
      if (!Number.isSafeInteger(valor) && Number.isInteger(valor) && /^id/i.test(clave)) {
        throw new Error("El navegador no admite identificadores de 64 bits sin pérdida de precisión.");
      }
      return String(valor);
    }
    return valor;
  });
}

export const textoOpcional = (valor) => String(valor ?? "").trim() || null;

export function decimalOpcional(valor, escala, positivo = false) {
  const texto = textoOpcional(valor)?.replace(",", ".") ?? null;
  if (texto === null) return null;
  const partes = /^([0-9]+)(?:\.([0-9]+))?$/.exec(texto);
  if (!partes || (partes[2]?.replace(/0+$/, "").length ?? 0) > escala ||
    (positivo && !/[1-9]/.test(texto))) {
    throw new Error(`Introduce un decimal ${positivo ? "positivo " : ""}con hasta ${escala} decimales y sin separadores de miles.`);
  }
  return texto;
}

export function enteroOpcional(valor) {
  if (valor == null || valor === "") return null;
  const numero = Number(valor);
  if (!/^[0-9]+$/.test(String(valor)) || !Number.isInteger(numero) || numero > 2147483647) {
    throw new Error("Introduce un número entero válido.");
  }
  return numero;
}

export const mismoId = (a, b) => a != null && b != null && String(a) === String(b);

export function idRuta(valor) {
  const id = String(valor);
  if (!/^[1-9][0-9]{0,18}$/.test(id)) throw new Error("El identificador no es válido.");
  return id;
}

export function fechaLocal() {
  const fecha = new Date();
  const dos = (valor) => String(valor).padStart(2, "0");
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

export function fechaHora(valor) {
  if (!valor) return "—";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? valor : fecha.toLocaleString("es");
}

export const mostrarDato = (valor) => valor == null || valor === "" ? "—" : String(valor);
