function TablaCompras({ compras, onEditar }) {
  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "Sin fecha";
    }

    return new Date(fecha).toLocaleDateString("es-CR");
  };

  const formatearMonto = (monto, moneda) => {
    if (monto === null || monto === undefined || monto === "") {
      return "No disponible";
    }

    return `${moneda || ""} ${Number(monto).toFixed(2)}`.trim();
  };

  const obtenerClaseTendencia = (tendencia) => {
    const valor = tendencia?.toLowerCase();

    if (valor === "subió") {
      return "badge badge--neutral";
    }

    if (valor === "bajó") {
      return "badge badge--success";
    }

    return "badge badge--neutral";
  };

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Proveedor</th>
            <th>Presentación</th>
            <th>Fecha</th>
            <th>Cantidad</th>
            <th>Precio total</th>
            <th>Precio unitario</th>
            <th>Tendencia</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {compras.map((compra) => (
            <tr key={compra.idCompra}>
              <td>
                <div>
                  <span className="table__cell-strong">
                    {compra.nombreProducto || "Sin producto"}
                  </span>
                  <br />
                  <span className="table__cell-muted">
                    {compra.categoria || "Sin categoría"} • {compra.marca || "Sin marca"}
                  </span>
                </div>
              </td>

              <td>
                <span className="table__cell-muted">
                  {compra.nombreProveedor || "Sin proveedor"}
                </span>
              </td>

              <td>
                <div>
                  <span className="table__cell-strong">
                    {compra.presentacion || "Sin presentación"}
                  </span>
                  <br />
                  <span className="table__cell-muted">
                    {compra.cantidadPresentacion || "0"} {compra.unidadMedida || ""}
                  </span>
                </div>
              </td>

              <td>
                <span className="table__cell-muted">
                  {formatearFecha(compra.fechaCompra)}
                </span>
              </td>

              <td>
                <span className="table__cell-muted">
                  {compra.cantidadComprada ?? "0"}
                </span>
              </td>

              <td>
                <span className="table__cell-muted">
                  {formatearMonto(compra.precioTotal, compra.moneda)}
                </span>
              </td>

              <td>
                <span className="table__cell-muted">
                  {formatearMonto(compra.precioUnitarioCalculado, compra.moneda)}
                </span>
              </td>

              <td>
                <span className={obtenerClaseTendencia(compra.tendenciaPrecio)}>
                  {compra.tendenciaPrecio || "Sin tendencia"}
                </span>
              </td>

              <td>
                <div className="table__actions">
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => onEditar(compra)}
                    type="button"
                  >
                    Editar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaCompras;