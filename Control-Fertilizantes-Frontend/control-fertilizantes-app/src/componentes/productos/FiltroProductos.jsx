function FiltrosProductos({
  busqueda,
  setBusqueda,
  filtroEstado,
  setFiltroEstado,
  filtroCategoria,
  setFiltroCategoria,
  categoriasDisponibles,
  onLimpiarFiltros
}) {
  return (
    <div className="toolbar">
      <div className="toolbar__search">
        <input
          type="text"
          placeholder="Buscar por nombre, categoría, marca o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input"
        />
      </div>

      <div className="toolbar__group">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="select"
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>

        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="select"
        >
          <option value="todas">Todas las categorías</option>
          {categoriasDisponibles.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="btn btn--secondary"
          onClick={onLimpiarFiltros}
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}

export default FiltrosProductos;