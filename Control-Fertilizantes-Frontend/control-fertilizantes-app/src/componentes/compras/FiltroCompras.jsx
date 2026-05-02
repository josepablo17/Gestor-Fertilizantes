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
    <div className="toolbar toolbar--wrap">
      
      {/* 🔍 Buscadores */}
      <div className="toolbar__group">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busquedaProducto}
          onChange={(e) => setBusquedaProducto(e.target.value)}
          className="input input--md"
        />

        <input
          type="text"
          placeholder="Buscar proveedor..."
          value={busquedaProveedor}
          onChange={(e) => setBusquedaProveedor(e.target.value)}
          className="input input--md"
        />
      </div>

      {/* 🎛️ Filtros */}
      <div className="toolbar__group">
        <select
          value={filtroMoneda}
          onChange={(e) => setFiltroMoneda(e.target.value)}
          className="select select--md"
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
          className="select select--md"
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
          className="input input--md"
        />

        <button
          className="btn btn--ghost btn--md"
          onClick={onLimpiarFiltros}
          type="button"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}

export default FiltrosCompras;