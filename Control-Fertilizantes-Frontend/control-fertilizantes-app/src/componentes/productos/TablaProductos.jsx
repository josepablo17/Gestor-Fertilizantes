function TablaProductos({ productos, onEditar, onDesactivar }) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Marca</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {productos.map((producto) => (
            <tr key={producto.idProducto}>
              <td className="table__cell-strong">
                {producto.nombre || "Sin nombre"}
              </td>

              <td className="table__cell-muted">
                {producto.categoria || "Sin categoría"}
              </td>

              <td className="table__cell-muted">
                {producto.marca || "Sin marca"}
              </td>

              <td>
                <span
                  className="table__cell-muted table__truncate"
                  title={producto.descripcion || "Sin descripción"}
                >
                  {producto.descripcion || "Sin descripción"}
                </span>
              </td>

              <td className="table__cell-nowrap">
                <span
                  className={
                    producto.activo
                      ? "badge badge--success"
                      : "badge badge--neutral"
                  }
                >
                  {producto.activo ? "Activo" : "Inactivo"}
                </span>
              </td>

              <td className="table__cell-nowrap">
                <div className="table__actions">
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={() => onEditar(producto)}
                  >
                    Editar
                  </button>

                  {producto.activo && (
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={() => onDesactivar(producto)}
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

export default TablaProductos;