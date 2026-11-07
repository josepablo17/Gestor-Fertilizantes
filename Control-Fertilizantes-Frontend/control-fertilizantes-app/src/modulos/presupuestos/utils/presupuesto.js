import { decimalOpcional, idRuta } from "../../../utils/datosApi.js";
import { formatearNumero } from "../../../utils/numeros.js";

export const monedas = [{ value: "CRC", label: "Colón costarricense (CRC)" }, { value: "USD", label: "Dólar estadounidense (USD)" }];
export const fechaCorta = (fecha) => fecha?.slice(0, 10) || "—";
export const monedaVisible = (valor, moneda) => `${moneda} ${formatearNumero(valor)}`;

export function importePositivo(valor) {
  const importe = decimalOpcional(valor, 4, true);
  if (!importe || importe.split(".")[0].replace(/^0+/, "").length > 14) {
    throw new Error("Indica un importe mayor a cero, con hasta 14 enteros y cuatro decimales.");
  }
  return importe;
}

export function importeEnDiezMilesimas(valor) {
  const texto = String(valor);
  const [entero, fraccion = ""] = texto.replace(/^-/, "").split(".");
  const magnitud = BigInt(entero) * 10000n + BigInt(fraccion.padEnd(4, "0").slice(0, 4));
  return texto.startsWith("-") ? -magnitud : magnitud;
}

export function desdeDiezMilesimas(valor) {
  const magnitud = valor < 0n ? -valor : valor;
  return `${valor < 0n ? "-" : ""}${magnitud / 10000n}.${String(magnitud % 10000n).padStart(4, "0")}`;
}

export function motivoValido(valor) {
  if (!valor.trim()) throw new Error("Indica el motivo de la operación.");
  return valor.trim();
}

export function filaDistribucion() {
  return { clave: crypto.randomUUID(), idPartidaPresupuesto: "", monto: "", idCompromisoDetalle: "", idProformaProveedorDetalle: "" };
}

export const nuevaImputacion = () => ({ motivo: "", motivoExceso: "", filas: [filaDistribucion()] });

export function prepararImputacion(datos, precioTotal) {
  const distribucion = datos.filas.map((fila) => {
    if (!fila.idPartidaPresupuesto) throw new Error("Selecciona una partida para cada distribución.");
    return {
      idPartidaPresupuesto: idRuta(fila.idPartidaPresupuesto), monto: importePositivo(fila.monto),
      idCompromisoDetalle: fila.idCompromisoDetalle ? idRuta(fila.idCompromisoDetalle) : null,
    };
  });
  const suma = distribucion.reduce((total, fila) => total + importeEnDiezMilesimas(fila.monto), 0n);
  if (suma !== importeEnDiezMilesimas(importePositivo(precioTotal))) {
    throw new Error("El reparto debe coincidir exactamente con el precio total de la compra.");
  }
  if (new Set(distribucion.map((fila) => fila.idPartidaPresupuesto)).size !== distribucion.length) {
    throw new Error("Usa una sola distribución por partida.");
  }
  return { distribucion, motivo: motivoValido(datos.motivo), motivoExceso: datos.motivoExceso.trim() || null };
}
