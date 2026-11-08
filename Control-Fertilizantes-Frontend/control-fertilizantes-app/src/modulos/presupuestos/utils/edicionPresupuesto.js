import { decimalOpcional, enteroOpcional } from "../../../utils/datosApi.js";
import { desdeDiezMilesimas, importeEnDiezMilesimas, importePositivo } from "./presupuesto.js";

export function prepararBorradorPresupuesto(datos, partidas) {
  if (!datos.nombre.trim() || !datos.fechaInicio || !datos.fechaFin || datos.fechaFin < datos.fechaInicio)
    throw new Error("Completa el nombre y un período válido para el presupuesto.");
  if (!["CRC", "USD"].includes(datos.moneda)) throw new Error("Selecciona la moneda del presupuesto.");
  if (partidas.length < 1 || partidas.length > 100) throw new Error("Agrega entre 1 y 100 partidas.");
  const preparadas = partidas.map((p) => {
    const id = enteroOpcional(p.idRubroPresupuesto);
    if (!id) throw new Error("Selecciona un rubro para cada partida.");
    return { idRubroPresupuesto: id, monto: importePositivo(p.monto) };
  });
  if (new Set(preparadas.map((p) => p.idRubroPresupuesto)).size !== preparadas.length)
    throw new Error("Usa una sola partida por rubro.");
  const finca = enteroOpcional(datos.idFinca);
  if (finca === 0) throw new Error("Selecciona una finca válida o deja el presupuesto como general.");
  return { nombre: datos.nombre.trim(), fechaInicio: datos.fechaInicio, fechaFin: datos.fechaFin,
    moneda: datos.moneda, idFinca: finca, partidas: preparadas };
}

export function vistaPreviaMonto(partida, valor) {
  const monto = decimalOpcional(valor, 4);
  if (monto === null || monto.split(".")[0].replace(/^0+/, "").length > 14)
    throw new Error("Indica un nuevo monto no negativo, con hasta 14 enteros y cuatro decimales.");
  const nuevo = importeEnDiezMilesimas(monto);
  const actual = importeEnDiezMilesimas(partida.aprobado);
  const diferencia = nuevo - actual;
  const disponible = nuevo - importeEnDiezMilesimas(partida.comprometido) - importeEnDiezMilesimas(partida.ejecutado);
  const magnitud = diferencia < 0n ? -diferencia : diferencia;
  const mensaje = diferencia === 0n ? "El monto aprobado no cambia."
    : magnitud > 999999999999999999n ? "La diferencia supera el rango de un ajuste individual."
      : diferencia < 0n && disponible < 0n ? "La reducción no puede consumir dinero ya reservado o gastado." : "";
  return {
    nuevoMonto: monto, montoAprobadoEsperado: desdeDiezMilesimas(actual), ajuste: desdeDiezMilesimas(diferencia),
    magnitud: desdeDiezMilesimas(magnitud), direccion: diferencia < 0n ? "Reducción" : "Aumento",
    disponible: desdeDiezMilesimas(disponible), mantieneExceso: disponible < 0n, puedeGuardar: !mensaje, mensaje,
  };
}
