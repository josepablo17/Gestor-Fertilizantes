function formatearMoneda(valor) {
  const numero = Number(valor ?? 0);

  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2
  }).format(numero);
}

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleDateString("es-CR");
}

function DetalleProformaProveedorContenido({ proforma }) {
  if (!proforma) {
    return (
      <section className="card">
        <div className="card__body">
          <p className="text-muted">No hay información de la proforma.</p>
        </div>
      </section>
    );
  }

  const detalles = proforma.detalles ?? [];

  return (
    <div className="stack">
      <section className="card">
        <div className="card__header">
          <div>
            <h2 className="card__title">Información general</h2>
            <p className="card__subtitle">
              Datos principales extraídos de la proforma del proveedor.
            </p>
          </div>

          <span className="badge">{proforma.estado || "Pendiente"}</span>
        </div>

        <div className="card__body">
          <div className="stats-grid">
            <div className="card">
              <div className="card__body">
                <p className="text-muted">Número de proforma</p>
                <h3 className="card__title">{proforma.numeroProforma}</h3>
              </div>
            </div>

            <div className="card">
              <div className="card__body">
                <p className="text-muted">Proveedor</p>
                <h3 className="card__title">
                  {proforma.nombreProveedor || "Sin proveedor"}
                </h3>
              </div>
            </div>

            <div className="card">
              <div className="card__body">
                <p className="text-muted">Fecha</p>
                <h3 className="card__title">
                  {formatearFecha(proforma.fechaProforma)}
                </h3>
              </div>
            </div>

            <div className="card">
              <div className="card__body">
                <p className="text-muted">Total</p>
                <h3 className="card__title">
                  {formatearMoneda(proforma.total)}
                </h3>
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div>
              <label className="label">Nombre proveedor PDF</label>
              <p>{proforma.nombreProveedorPdf || "Sin dato"}</p>
            </div>

            <div>
              <label className="label">Nombre negocio</label>
              <p>{proforma.nombreNegocio || "Sin dato"}</p>
            </div>

            <div>
              <label className="label">Razón social</label>
              <p>{proforma.razonSocial || "Sin dato"}</p>
            </div>

            <div>
              <label className="label">Cédula</label>
              <p>{proforma.cedula || "Sin dato"}</p>
            </div>

            <div>
              <label className="label">Teléfono</label>
              <p>{proforma.telefono || "Sin dato"}</p>
            </div>

            <div>
              <label className="label">Vendedor</label>
              <p>{proforma.vendedor || "Sin dato"}</p>
            </div>

            <div>
              <label className="label">Fecha vencimiento</label>
              <p>{formatearFecha(proforma.fechaVencimiento)}</p>
            </div>

            <div>
              <label className="label">Días crédito</label>
              <p>{proforma.diasCredito ?? "N/A"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card__header">
          <div>
            <h2 className="card__title">Líneas de la proforma</h2>
            <p className="card__subtitle">
              Productos detectados, precios, cantidades y estado de validación.
            </p>
          </div>
        </div>

        <div className="card__body">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción proveedor</th>
                  <th>Producto sistema</th>
                  <th>Presentación</th>
                  <th>Cantidad</th>
                  <th>Precio unitario</th>
                  <th>Descuento</th>
                  <th>Total línea</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {detalles.length === 0 ? (
                  <tr>
                    <td colSpan="9">
                      Esta proforma no tiene líneas registradas.
                    </td>
                  </tr>
                ) : (
                  detalles.map((detalle) => (
                    <tr key={detalle.idProformaProveedorDetalle}>
                      <td>{detalle.codigoProveedor || "N/A"}</td>

                      <td>
                        <div className="table__cell-strong">
                          {detalle.descripcionProveedor}
                        </div>

                        {detalle.observacionValidacion && (
                          <small className="text-muted">
                            {detalle.observacionValidacion}
                          </small>
                        )}
                      </td>

                      <td>{detalle.nombreProducto || "No asignado"}</td>

                      <td>{detalle.descripcionPresentacion || "No asignada"}</td>

                      <td>{detalle.cantidad}</td>

                      <td>{formatearMoneda(detalle.precioUnitario)}</td>

                      <td>{detalle.descuentoPorcentaje ?? 0}%</td>

                      <td className="table__cell-strong">
                        {formatearMoneda(detalle.totalLinea)}
                      </td>

                      <td>
                        {detalle.sePuedeRegistrar ? (
                          <span className="badge">Lista</span>
                        ) : (
                          <span className="badge">Pendiente</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card__header">
          <div>
            <h2 className="card__title">Resumen financiero</h2>
            <p className="card__subtitle">
              Totales generales registrados desde la proforma.
            </p>
          </div>
        </div>

        <div className="card__body">
          <div className="stats-grid">
            <div>
              <label className="label">Subtotal</label>
              <p className="table__cell-strong">
                {formatearMoneda(proforma.subtotal)}
              </p>
            </div>

            <div>
              <label className="label">Descuento</label>
              <p className="table__cell-strong">
                {formatearMoneda(proforma.descuento)}
              </p>
            </div>

            <div>
              <label className="label">IVA</label>
              <p className="table__cell-strong">
                {formatearMoneda(proforma.iva)}
              </p>
            </div>

            <div>
              <label className="label">Total</label>
              <p className="table__cell-strong">
                {formatearMoneda(proforma.total)}
              </p>
            </div>
          </div>

          {proforma.observaciones && (
            <div>
              <label className="label">Observaciones</label>
              <p>{proforma.observaciones}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default DetalleProformaProveedorContenido;