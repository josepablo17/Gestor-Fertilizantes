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
    <div className="barra-herramientas-productos">
      <div className="grupo-busqueda-productos">
        <input
          type="text"
          placeholder="Buscar por nombre, categoría, marca o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-busqueda-productos"
        />
      </div>

      <div className="grupo-filtros-productos">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="select-filtro-productos"
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>

        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="select-filtro-productos"
        >
          <option value="todas">Todas las categorías</option>
          {categoriasDisponibles.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>

        <button
          className="boton-limpiar-filtros"
          onClick={onLimpiarFiltros}
          type="button"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}

export default FiltrosProductos;