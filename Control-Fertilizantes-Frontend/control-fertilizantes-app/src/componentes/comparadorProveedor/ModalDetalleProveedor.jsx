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
      <div
        className="modal-detalle-proveedor"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-detalle-proveedor__encabezado">
          <div>
            <h2>Detalle del proveedor</h2>
            <p>
              Revise el comportamiento histórico de compra para este proveedor.
            </p>
          </div>

          <button
            type="button"
            className="modal-detalle-proveedor__cerrar"
            onClick={onCerrar}
          >
            ×
          </button>
        </div>

        <div className="modal-detalle-proveedor__resumen">
          <div className="card-detalle-proveedor">
            <span>Proveedor</span>
            <strong>{detalleProveedor.nombreProveedor}</strong>
          </div>

          <div className="card-detalle-proveedor">
            <span>Último precio</span>
            <strong>{formatearMoneda(detalleProveedor.ultimoPrecioUnitario)}</strong>
          </div>

          <div className="card-detalle-proveedor">
            <span>Promedio histórico</span>
            <strong>{formatearMoneda(detalleProveedor.promedioHistorico)}</strong>
          </div>

          <div className="card-detalle-proveedor">
            <span>Cantidad de compras</span>
            <strong>{detalleProveedor.cantidadCompras ?? 0}</strong>
          </div>

          <div className="card-detalle-proveedor">
            <span>Variación</span>
            <strong>
              {Number(detalleProveedor.variacionPorcentual ?? 0).toFixed(2)}%
            </strong>
          </div>

          <div className="card-detalle-proveedor">
            <span>Tendencia</span>
            <strong>{detalleProveedor.tendencia || "Sin referencia"}</strong>
          </div>
        </div>

        <div className="modal-detalle-proveedor__historial">
          <div className="modal-detalle-proveedor__subencabezado">
            <h3>Historial de compras</h3>
            <p>Movimientos registrados para este proveedor.</p>
          </div>

          {historial.length === 0 ? (
            <div className="tabla-detalle-vacia">
              No hay historial disponible para este proveedor.
            </div>
          ) : (
            <div className="tabla-responsive">
              <table className="tabla-detalle-proveedor">
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

        <div className="modal-detalle-proveedor__acciones">
          <button
            type="button"
            className="boton-secundario"
            onClick={onCerrar}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalDetalleProveedor;