function TablaProductos({ productos, onEditar, onDesactivar }) {
  return (
    <div className="tabla-responsive">
      <table className="tabla-productos">
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
              <td>
                <div className="celda-producto">
                  <span className="nombre-producto">
                    {producto.nombre || "Sin nombre"}
                  </span>
                </div>
              </td>

              <td>
                <span className="texto-secundario">
                  {producto.categoria || "Sin categoría"}
                </span>
              </td>

              <td>
                <span className="texto-secundario">
                  {producto.marca || "Sin marca"}
                </span>
              </td>

              <td>
                <span
                  className="descripcion-producto"
                  title={producto.descripcion || "Sin descripción"}
                >
                  {producto.descripcion || "Sin descripción"}
                </span>
              </td>

              <td>
                <span
                  className={
                    producto.activo
                      ? "estado-badge estado-activo"
                      : "estado-badge estado-inactivo"
                  }
                >
                  <span className="punto-estado"></span>
                  {producto.activo ? "Activo" : "Inactivo"}
                </span>
              </td>

              <td>
                <div className="acciones-tabla">
                  <button
                    className="boton-tabla boton-editar"
                    onClick={() => onEditar(producto)}
                    type="button"
                  >
                    Editar
                  </button>

                  {producto.activo && (
                    <button
                      className="boton-tabla boton-eliminar"
                      onClick={() => onDesactivar(producto)}
                      type="button"
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