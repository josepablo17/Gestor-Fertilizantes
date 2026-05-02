function ResumenProformaValidada({ vistaPrevia, resumen, formatearMoneda }) {
  if (!vistaPrevia) return null;

  return (
    <section className="stats-grid">
      <article className="card card--mini">
        <span className="label">Proveedor</span>
        <strong>{vistaPrevia.nombreProveedorSistema || "No encontrado"}</strong>
      </article>

      <article className="card card--mini">
        <span className="label">Líneas válidas</span>
        <strong>{resumen.cantidadLineasValidas}</strong>
      </article>

      <article className="card card--mini">
        <span className="label">Líneas pendientes</span>
        <strong>{resumen.cantidadLineasPendientes}</strong>
      </article>

      <article className="card card--mini">
        <span className="label">Total proforma</span>
        <strong>{formatearMoneda(vistaPrevia.total)}</strong>
      </article>
    </section>
  );
}

export default ResumenProformaValidada;