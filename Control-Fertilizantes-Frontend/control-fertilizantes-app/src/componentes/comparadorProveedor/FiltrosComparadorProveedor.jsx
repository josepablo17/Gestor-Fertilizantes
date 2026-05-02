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
    <div className="toolbar toolbar--wrap">
      <div className="toolbar__group">
        <select
          id="idProducto"
          value={filtros.idProducto}
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

        <select
          id="idPresentacionProducto"
          value={filtros.idPresentacionProducto}
          onChange={manejarCambioPresentacion}
          className="select"
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

        <select
          id="moneda"
          value={filtros.moneda}
          onChange={manejarCambioMoneda}
          className="select"
        >
          <option value="">Todas las monedas</option>
          <option value="CRC">CRC</option>
          <option value="USD">USD</option>
        </select>

        <select
          id="mesesAnalisis"
          value={filtros.mesesAnalisis}
          onChange={manejarCambioMesesAnalisis}
          className="select"
        >
          <option value={3}>Últimos 3 meses</option>
          <option value={6}>Últimos 6 meses</option>
          <option value={12}>Últimos 12 meses</option>
          <option value={24}>Últimos 24 meses</option>
        </select>
      </div>

      <div className="toolbar__group">
        <label className="checkbox-inline">
          <input
            type="checkbox"
            checked={filtros.soloAutorizados}
            onChange={manejarCambioSoloAutorizados}
          />
          <span>Solo autorizados</span>
        </label>

        <button
          type="button"
          className="btn btn--secondary"
          onClick={onLimpiar}
        >
          Limpiar filtros
        </button>

        <button
          type="button"
          className="btn btn--primary"
          onClick={onComparar}
        >
          Comparar proveedores
        </button>
      </div>
    </div>
  );
}

export default FiltrosComparadorProveedor;