function DetalleProformaValidada({
  vistaPrevia,
  formatearMoneda,
  formatearFecha
}) {
  if (!vistaPrevia) return null;

  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h2 className="card__title">Información de la proforma</h2>
          <p className="card__subtitle">
            Datos extraídos automáticamente desde el PDF.
          </p>
        </div>
      </div>

      <div className="card__body">
        <div className="stats-grid">
          <div>
            <span className="label">Número</span>
            <p>{vistaPrevia.numeroProforma}</p>
          </div>

          <div>
            <span className="label">Fecha</span>
            <p>{formatearFecha(vistaPrevia.fecha)}</p>
          </div>

          <div>
            <span className="label">Proveedor PDF</span>
            <p>{vistaPrevia.nombreProveedorPdf}</p>
          </div>

          <div>
            <span className="label">Proveedor sistema</span>
            <p>{vistaPrevia.nombreProveedorSistema || "No encontrado"}</p>
          </div>

          <div>
            <span className="label">Negocio</span>
            <p>{vistaPrevia.nombreNegocio || "Sin dato"}</p>
          </div>

          <div>
            <span className="label">Razón social</span>
            <p>{vistaPrevia.razonSocial || "Sin dato"}</p>
          </div>

          <div>
            <span className="label">Cédula</span>
            <p>{vistaPrevia.cedula || "Sin dato"}</p>
          </div>

          <div>
            <span className="label">Teléfono</span>
            <p>{vistaPrevia.telefono || "Sin dato"}</p>
          </div>

          <div>
            <span className="label">Subtotal</span>
            <p>{formatearMoneda(vistaPrevia.subtotal)}</p>
          </div>

          <div>
            <span className="label">Descuento</span>
            <p>{formatearMoneda(vistaPrevia.descuento)}</p>
          </div>

          <div>
            <span className="label">IVA</span>
            <p>{formatearMoneda(vistaPrevia.iva)}</p>
          </div>

          <div>
            <span className="label">Total</span>
            <p>{formatearMoneda(vistaPrevia.total)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DetalleProformaValidada;