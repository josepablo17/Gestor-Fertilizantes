const formatoDecimal = new Intl.NumberFormat("es-CR", { maximumFractionDigits: 1 });
const formatoEntero = new Intl.NumberFormat("es-CR", { maximumFractionDigits: 0 });

export function formatearNumero(valor) {
  if (valor == null || valor === "" || !Number.isFinite(Number(valor))) return "—";
  const magnitud = Math.abs(Number(valor));
  if (magnitud > 0 && magnitud < 0.05) return Number(valor) < 0 ? "> −0,1" : "< 0,1";
  return formatoDecimal.format(valor);
}

export function formatearCantidadComprada(valor) {
  if (valor == null || valor === "" || !Number.isFinite(Number(valor))) return "—";
  return Number.isInteger(Number(valor)) ? formatoEntero.format(valor) : "Cantidad fraccionaria";
}

export function numeroEditable(valor) {
  return String(valor ?? "").replace(/([.,][0-9]*?)0+$/, "$1").replace(/[.,]$/, "");
}
