function FiltrosCompras({
  busquedaProducto,
  setBusquedaProducto,
  busquedaProveedor,
  setBusquedaProveedor,
  filtroMoneda,
  setFiltroMoneda,
  filtroTendencia,
  setFiltroTendencia,
  filtroFecha,
  setFiltroFecha,
  monedasDisponibles,
  tendenciasDisponibles,
  onLimpiarFiltros
}) {
  return (
    <div className="barra-herramientas">
      <div className="grupo-busqueda">
        <input
          type="text"
          placeholder="Buscar por producto, categoría, marca o presentación..."
          value={busquedaProducto}
          onChange={(e) => setBusquedaProducto(e.target.value)}
          className="input-busqueda"
        />
      </div>

      <div className="grupo-busqueda">
        <input
          type="text"
          placeholder="Buscar por proveedor..."
          value={busquedaProveedor}
          onChange={(e) => setBusquedaProveedor(e.target.value)}
          className="input-busqueda"
        />
      </div>

      <div className="grupo-filtros">
        <select
          value={filtroMoneda}
          onChange={(e) => setFiltroMoneda(e.target.value)}
          className="select-filtro"
        >
          <option value="todas">Todas las monedas</option>
          {monedasDisponibles.map((moneda) => (
            <option key={moneda} value={moneda}>
              {moneda}
            </option>
          ))}
        </select>

        <select
          value={filtroTendencia}
          onChange={(e) => setFiltroTendencia(e.target.value)}
          className="select-filtro"
        >
          <option value="todas">Todas las tendencias</option>
          {tendenciasDisponibles.map((tendencia) => (
            <option key={tendencia} value={tendencia}>
              {tendencia}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
          className="input-fecha"
        />

        <button
          className="boton-base boton-limpiar"
          onClick={onLimpiarFiltros}
          type="button"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}

export default FiltrosCompras;