export function formatearMoneda(valor, moneda) {
  if (valor == null || valor === "") return "—";
  const formato = new Intl.NumberFormat("es-CR", { style: "currency", currency: moneda,
    minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const magnitud = Math.abs(Number(valor));
  if (magnitud > 0 && magnitud < 0.05) return Number(valor) < 0 ? `> ${formato.format(-0.1)}` : `< ${formato.format(0.1)}`;
  return formato.format(valor);
}
