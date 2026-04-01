function FiltrosPresentacionesProducto({
  busqueda,
  setBusqueda,
  filtroEstado,
  setFiltroEstado,
  filtroProducto,
  setFiltroProducto,
  filtroUnidadMedida,
  setFiltroUnidadMedida,
  productosDisponibles,
  unidadesMedidaDisponibles,
  onLimpiarFiltros
}) {
  return (
    <div className="barra-herramientas">
      <div className="grupo-busqueda">
        <input
          type="text"
          placeholder="Buscar por producto, descripción o unidad de medida..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-busqueda"
        />
      </div>

      <div className="grupo-filtros">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="select-filtro"
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>

        <select
          value={filtroProducto}
          onChange={(e) => setFiltroProducto(e.target.value)}
          className="select-filtro"
        >
          <option value="todos">Todos los productos</option>
          {productosDisponibles.map((producto) => (
            <option key={producto} value={producto}>
              {producto}
            </option>
          ))}
        </select>

        <select
          value={filtroUnidadMedida}
          onChange={(e) => setFiltroUnidadMedida(e.target.value)}
          className="select-filtro"
        >
          <option value="todas">Todas las unidades</option>
          {unidadesMedidaDisponibles.map((unidad) => (
            <option key={unidad} value={unidad}>
              {unidad}
            </option>
          ))}
        </select>

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

export default FiltrosPresentacionesProducto;