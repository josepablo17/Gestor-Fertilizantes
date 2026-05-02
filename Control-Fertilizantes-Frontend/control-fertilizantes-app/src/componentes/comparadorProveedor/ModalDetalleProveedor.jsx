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

function ModalDetalleProveedor({ detalleProveedor, onCerrar }) {
  if (!detalleProveedor) return null;

  const historial = detalleProveedor.historial ?? [];

  return (
    <div className="modal-detalle-overlay" onClick={onCerrar}>
      <div className="card" onClick={(e) => e.stopPropagation()}>
        <div className="card__header">
          <div
            className="flex"
            style={{
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem"
            }}
          >
            <div className="stack" style={{ gap: "0.35rem" }}>
              <h2>Detalle del proveedor</h2>
              <p className="text-muted">
                Revise el comportamiento histórico de compra para este proveedor.
              </p>
            </div>

            <button
              type="button"
              className="btn btn--ghost"
              onClick={onCerrar}
            >
              ×
            </button>
          </div>
        </div>

        <div className="card__body">
          <div className="stack" style={{ gap: "1.5rem" }}>
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1rem"
              }}
            >
              <div className="card">
                <div className="card__body">
                  <div className="stack" style={{ gap: "0.35rem" }}>
                    <span className="label">Proveedor</span>
                    <strong>{detalleProveedor.nombreProveedor}</strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card__body">
                  <div className="stack" style={{ gap: "0.35rem" }}>
                    <span className="label">Último precio</span>
                    <strong>
                      {formatearMoneda(detalleProveedor.ultimoPrecioUnitario)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card__body">
                  <div className="stack" style={{ gap: "0.35rem" }}>
                    <span className="label">Promedio histórico</span>
                    <strong>
                      {formatearMoneda(detalleProveedor.promedioHistorico)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card__body">
                  <div className="stack" style={{ gap: "0.35rem" }}>
                    <span className="label">Cantidad de compras</span>
                    <strong>{detalleProveedor.cantidadCompras ?? 0}</strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card__body">
                  <div className="stack" style={{ gap: "0.35rem" }}>
                    <span className="label">Variación</span>
                    <strong>
                      {Number(detalleProveedor.variacionPorcentual ?? 0).toFixed(2)}%
                    </strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card__body">
                  <div className="stack" style={{ gap: "0.35rem" }}>
                    <span className="label">Tendencia</span>
                    <strong>{detalleProveedor.tendencia || "Sin referencia"}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="stack" style={{ gap: "0.75rem" }}>
              <div className="stack" style={{ gap: "0.35rem" }}>
                <h3>Historial de compras</h3>
                <p className="text-muted">
                  Movimientos registrados para este proveedor.
                </p>
              </div>

              {historial.length === 0 ? (
                <div className="card">
                  <div className="card__body">
                    <p className="text-muted">
                      No hay historial disponible para este proveedor.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Cantidad</th>
                        <th>Precio total</th>
                        <th>Precio unitario</th>
                        <th>Moneda</th>
                        <th>Observaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historial.map((item) => (
                        <tr key={item.idCompra}>
                          <td>{formatearFecha(item.fechaCompra)}</td>
                          <td>{Number(item.cantidadComprada ?? 0).toFixed(2)}</td>
                          <td>{formatearMoneda(item.precioTotal)}</td>
                          <td>{formatearMoneda(item.precioUnitario)}</td>
                          <td>{item.moneda || "-"}</td>
                          <td>{item.observaciones || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div
              className="flex"
              style={{ justifyContent: "flex-end", gap: "0.75rem" }}
            >
              <button
                type="button"
                className="btn btn--ghost"
                onClick={onCerrar}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalDetalleProveedor;