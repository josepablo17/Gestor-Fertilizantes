function TablaPresentacionesProducto({ presentacionesProducto, onEditar, onDesactivar }) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Descripción</th>
            <th>Cantidad</th>
            <th>Unidad de medida</th>
            <th>Cantidad normalizada</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {presentacionesProducto.map((presentacion) => (
            <tr key={presentacion.idPresentacionProducto}>
              <td>
                <span className="table__cell-strong">
                  {presentacion.nombreProducto || "Sin producto"}
                </span>
              </td>

              <td>
                <span
                  className="table__cell-muted table__cell-truncate"
                  title={presentacion.descripcion || "Sin descripción"}
                >
                  {presentacion.descripcion || "Sin descripción"}
                </span>
              </td>

              <td>
                <span className="table__cell-muted">
                  {presentacion.cantidad ?? "0"}
                </span>
              </td>

              <td>
                <span className="table__cell-muted">
                  {presentacion.nombreUnidadMedida || "Sin unidad"}
                </span>
              </td>

              <td>
                <span className="table__cell-muted">
                  {presentacion.cantidadNormalizada ?? "0"}
                </span>
              </td>

              <td>
                <span
                  className={
                    presentacion.activo
                      ? "badge badge--success"
                      : "badge badge--neutral"
                  }
                >
                  {presentacion.activo ? "Activo" : "Inactivo"}
                </span>
              </td>

              <td>
                <div className="table__actions">
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={() => onEditar(presentacion)}
                  >
                    Editar
                  </button>

                  {presentacion.activo && (
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={() => onDesactivar(presentacion)}
                    >
                      Desactivar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaPresentacionesProducto;