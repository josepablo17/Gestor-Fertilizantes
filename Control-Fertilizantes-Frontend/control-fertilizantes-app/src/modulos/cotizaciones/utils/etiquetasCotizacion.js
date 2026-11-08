const etiquetas = {
  PendienteEnvio: "Pendiente de envío",
  EnRevision: "En revisión",
  SinCotizar: "Sin cotizar",
  NoDisponible: "No disponible",
  SinDefinir: "Pendiente de definir",
  Bruto: "Bruto (antes de descuentos e impuestos)",
  NetoSinImpuestos: "Neto sin impuestos",
  ConImpuestos: "Con impuestos",
  ConDiferencias: "Con diferencias justificadas",
  NoCompatible: "Formato no compatible",
};

export function etiquetaCotizacion(valor) {
  return etiquetas[valor] ?? valor ?? "—";
}

export function etiquetaConciliacion(valor) {
  if (valor === "Pendiente") return "Pendiente de comprobar";
  if (valor === "Conciliada") return "Importes comprobados";
  return etiquetaCotizacion(valor);
}
