function FiltrosComparadorProveedor({
  productos = [],
  presentaciones = [],
  filtros,
  setFiltros,
  onComparar,
  onLimpiar
}) {
  const manejarCambioProducto = (e) => {
    const nuevoIdProducto = e.target.value;

    setFiltros((prev) => ({
      ...prev,
      idProducto: nuevoIdProducto,
      idPresentacionProducto: ""
    }));
  };

  const manejarCambioPresentacion = (e) => {
    setFiltros((prev) => ({
      ...prev,
      idPresentacionProducto: e.target.value
    }));
  };

  const manejarCambioMoneda = (e) => {
    setFiltros((prev) => ({
      ...prev,
      moneda: e.target.value
    }));
  };

  const manejarCambioMesesAnalisis = (e) => {
    setFiltros((prev) => ({
      ...prev,
      mesesAnalisis: Number(e.target.value)
    }));
  };

  const manejarCambioSoloAutorizados = (e) => {
    setFiltros((prev) => ({
      ...prev,
      soloAutorizados: e.target.checked
    }));
  };

  return (
    <div className="barra-filtros-comparador">
      <div className="card-filtros-comparador">
        <div className="card-filtros-comparador__encabezado">
          <h2>Filtros de comparación</h2>
          <p>
            Seleccione el producto y los criterios que desea analizar para
            comparar proveedores.
          </p>
        </div>

        <div className="grid-filtros-comparador">
          <div className="campo-filtro-comparador">
            <label htmlFor="idProducto">Producto</label>
            <select
              id="idProducto"
              value={filtros.idProducto}
              onChange={manejarCambioProducto}
            >
              <option value="">Seleccione un producto</option>
              {productos.map((producto) => (
                <option key={producto.idProducto} value={producto.idProducto}>
                  {producto.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="campo-filtro-comparador">
            <label htmlFor="idPresentacionProducto">Presentación</label>
            <select
              id="idPresentacionProducto"
              value={filtros.idPresentacionProducto}
              onChange={manejarCambioPresentacion}
              disabled={!filtros.idProducto}
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

          <div className="campo-filtro-comparador">
            <label htmlFor="moneda">Moneda</label>
            <select
              id="moneda"
              value={filtros.moneda}
              onChange={manejarCambioMoneda}
            >
              <option value="">Todas</option>
              <option value="CRC">CRC</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div className="campo-filtro-comparador">
            <label htmlFor="mesesAnalisis">Período de análisis</label>
            <select
              id="mesesAnalisis"
              value={filtros.mesesAnalisis}
              onChange={manejarCambioMesesAnalisis}
            >
              <option value={3}>Últimos 3 meses</option>
              <option value={6}>Últimos 6 meses</option>
              <option value={12}>Últimos 12 meses</option>
              <option value={24}>Últimos 24 meses</option>
            </select>
          </div>
        </div>

        <div className="acciones-filtros-comparador">
          <label className="check-filtro-comparador">
            <input
              type="checkbox"
              checked={filtros.soloAutorizados}
              onChange={manejarCambioSoloAutorizados}
            />
            <span>Mostrar solo proveedores autorizados</span>
          </label>

          <div className="botones-filtros-comparador">
            <button
              type="button"
              className="boton-secundario"
              onClick={onLimpiar}
            >
              Limpiar
            </button>

            <button
              type="button"
              className="boton-primario"
              onClick={onComparar}
            >
              Comparar proveedores
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FiltrosComparadorProveedor;