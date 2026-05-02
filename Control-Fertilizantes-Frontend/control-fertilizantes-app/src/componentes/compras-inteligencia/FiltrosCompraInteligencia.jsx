function FiltrosCompraInteligencia({
  productos,
  presentaciones,
  idProducto,
  setIdProducto,
  idPresentacionProducto,
  setIdPresentacionProducto,
  onLimpiarFiltros
}) {
  const manejarCambioProducto = (e) => {
    const nuevoIdProducto = e.target.value;
    setIdProducto(nuevoIdProducto);
    setIdPresentacionProducto("");
  };

  const cantidadProductos = productos?.length ?? 0;
  const cantidadPresentaciones = presentaciones?.length ?? 0;

  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h3 className="card__title">Configura el análisis</h3>
          <p className="card__subtitle">
            Selecciona el producto y la presentación para consultar precios históricos,
            tendencias, alertas y evaluación automática.
          </p>
        </div>

        <div className="toolbar__group">
          <span className="badge badge--neutral">
            {cantidadProductos} producto{cantidadProductos !== 1 ? "s" : ""}
          </span>
          <span className="badge badge--neutral">
            {cantidadPresentaciones} presentaci{cantidadPresentaciones !== 1 ? "ones" : "ón"}
          </span>
        </div>
      </div>

      <div className="card__body">
        <div className="toolbar">
          <div className="toolbar__group">
            <div className="form__group">
              <label className="label" htmlFor="idProducto">
                Producto
              </label>
              <select
                id="idProducto"
                value={idProducto}
                onChange={manejarCambioProducto}
                className="select"
              >
                <option value="">Seleccione un producto</option>
                {productos.map((producto) => (
                  <option key={producto.idProducto} value={producto.idProducto}>
                    {producto.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form__group">
              <label className="label" htmlFor="idPresentacionProducto">
                Presentación
              </label>
              <select
                id="idPresentacionProducto"
                value={idPresentacionProducto}
                onChange={(e) => setIdPresentacionProducto(e.target.value)}
                className="select"
                disabled={!idProducto}
              >
                <option value="">Seleccione una presentación</option>
                {presentaciones.map((presentacion) => (
                  <option
                    key={presentacion.idPresentacionProducto}
                    value={presentacion.idPresentacionProducto}
                  >
                    {presentacion.descripcion}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="toolbar__group">
            <button
              className="btn btn--ghost btn--md"
              onClick={onLimpiarFiltros}
              type="button"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FiltrosCompraInteligencia;