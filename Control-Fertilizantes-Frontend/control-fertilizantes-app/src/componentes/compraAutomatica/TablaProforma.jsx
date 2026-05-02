function TablaProforma({
  lineas,
  productos,
  presentaciones,
  cargandoCatalogos,
  formatearMoneda,
  onMapearLinea
}) {
  if (!lineas || lineas.length === 0) {
    return (
      <section className="card">
        <div className="card__body">
          <p className="text-muted">
            No hay líneas detectadas en la proforma.
          </p>
        </div>
      </section>
    );
  }

  const obtenerPresentacionesPorProducto = (idProducto) => {
    if (!idProducto) return [];

    return presentaciones.filter(
      (presentacion) =>
        Number(presentacion.idProducto) === Number(idProducto)
    );
  };

  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h2 className="card__title">Líneas detectadas</h2>
          <p className="card__subtitle">
            Revise cuáles productos fueron encontrados en el sistema y cuáles requieren mapeo.
          </p>
        </div>
      </div>

      <div className="card__body">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción PDF</th>
                <th>Producto sistema</th>
                <th>Presentación</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {lineas.map((linea, index) => {
                const esPendiente = !linea.sePuedeRegistrar;
                const presentacionesFiltradas = obtenerPresentacionesPorProducto(
                  linea.idProducto
                );

                return (
                  <tr key={`${linea.codigo}-${index}`}>
                    <td>{linea.codigo}</td>

                    <td>
                      <strong className="table__cell-strong">
                        {linea.descripcion}
                      </strong>

                      {esPendiente && (
                        <p className="text-muted">
                          {linea.observacionValidacion}
                        </p>
                      )}
                    </td>

                    <td>
                      {esPendiente ? (
                        <select
                          className="select"
                          value={linea.idProducto ?? ""}
                          disabled={cargandoCatalogos}
                          onChange={(e) =>
                            onMapearLinea(index, e.target.value, "")
                          }
                        >
                          <option value="">
                            {cargandoCatalogos
                              ? "Cargando productos..."
                              : "Seleccionar producto"}
                          </option>

                          {productos.map((producto) => (
                            <option
                              key={producto.idProducto}
                              value={producto.idProducto}
                            >
                              {producto.nombre}
                            </option>
                          ))}
                        </select>
                      ) : (
                        linea.nombreProductoSistema || "Pendiente"
                      )}
                    </td>

                    <td>
                      {esPendiente ? (
                        <select
                          className="select"
                          value={linea.idPresentacionProducto ?? ""}
                          disabled={cargandoCatalogos || !linea.idProducto}
                          onChange={(e) =>
                            onMapearLinea(
                              index,
                              linea.idProducto,
                              e.target.value
                            )
                          }
                        >
                          <option value="">
                            {!linea.idProducto
                              ? "Seleccione producto primero"
                              : "Seleccionar presentación"}
                          </option>

                          {presentacionesFiltradas.map((presentacion) => (
                            <option
                              key={presentacion.idPresentacionProducto}
                              value={presentacion.idPresentacionProducto}
                            >
                              {presentacion.descripcion}
                            </option>
                          ))}
                        </select>
                      ) : (
                        linea.nombrePresentacionSistema || "Pendiente"
                      )}
                    </td>

                    <td>{linea.cantidad}</td>
                    <td>{formatearMoneda(linea.precio)}</td>
                    <td>{formatearMoneda(linea.totalLinea)}</td>

                    <td>
                      <span
                        className={
                          linea.sePuedeRegistrar
                            ? "badge badge--success"
                            : "badge badge--warning"
                        }
                      >
                        {linea.sePuedeRegistrar ? "Válida" : "Pendiente"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default TablaProforma;