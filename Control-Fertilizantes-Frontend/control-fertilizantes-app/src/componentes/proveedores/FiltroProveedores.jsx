function FiltroProveedores({
    busqueda,
    setBusqueda,
    filtroEstado,
    setFiltroEstado,
    onLimpiarFiltros
}) {
    return (
        <div className="barra-herramientas filtros-proveedores">
            <div className="grupo-busqueda">
                <input
                    id="busquedaProveedor"
                    className="input-busqueda"
                    type="text"
                    placeholder="Nombre, contacto o teléfono..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            <div className="grupo-filtros">
                <div className="campo-filtro">
                    <label htmlFor="estadoProveedor">Estado</label>
                    <select
                        id="estadoProveedor"
                        className="select-filtro"
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                        <option value="todos">Todos</option>
                        <option value="activos">Activos</option>
                        <option value="inactivos">Inactivos</option>
                    </select>
                </div>

                <button
                    className="boton-base boton-limpiar"
                    onClick={onLimpiarFiltros}
                    type="button"
                >
                    Limpiar
                </button>
            </div>
        </div>
    );
}

export default FiltroProveedores;