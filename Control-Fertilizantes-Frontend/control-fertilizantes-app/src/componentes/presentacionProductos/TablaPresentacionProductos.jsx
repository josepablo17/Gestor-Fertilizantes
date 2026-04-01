function TablaPresentacionesProducto({ presentacionesProducto, onEditar, onDesactivar }) {
  return (
    <div className="tabla-responsive">
      <table className="tabla-modulo">
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
                <div className="celda-principal">
                  <span className="texto-principal">
                    {presentacion.nombreProducto || "Sin producto"}
                  </span>
                </div>
              </td>

              <td>
                <span
                  className="texto-truncado"
                  title={presentacion.descripcion || "Sin descripción"}
                >
                  {presentacion.descripcion || "Sin descripción"}
                </span>
              </td>

              <td>
                <span className="texto-secundario">
                  {presentacion.cantidad ?? "0"}
                </span>
              </td>

              <td>
                <span className="texto-secundario">
                  {presentacion.nombreUnidadMedida || "Sin unidad"}
                </span>
              </td>

              <td>
                <span className="texto-secundario">
                  {presentacion.cantidadNormalizada ?? "0"}
                </span>
              </td>

              <td>
                <span
                  className={
                    presentacion.activo
                      ? "estado-badge estado-activo"
                      : "estado-badge estado-inactivo"
                  }
                >
                  <span className="punto-estado"></span>
                  {presentacion.activo ? "Activo" : "Inactivo"}
                </span>
              </td>

              <td>
                <div className="acciones-tabla">
                  <button
                    className="boton-base boton-tabla boton-editar"
                    onClick={() => onEditar(presentacion)}
                    type="button"
                  >
                    Editar
                  </button>

                  {presentacion.activo && (
                    <button
                      className="boton-base boton-tabla boton-eliminar"
                      onClick={() => onDesactivar(presentacion)}
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

export default TablaPresentacionesProducto;