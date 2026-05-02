function FiltroProveedores({
    busqueda,
    setBusqueda,
    filtroEstado,
    setFiltroEstado,
    onLimpiarFiltros
}) {
    return (
        <div className="toolbar">
            <div className="toolbar__search">
                <input
                    id="busquedaProveedor"
                    className="input"
                    type="text"
                    placeholder="Nombre, contacto o teléfono..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            <div className="toolbar__group">
                <div className="form-group">
                    <label htmlFor="estadoProveedor" className="form-label">
                        Estado
                    </label>
                    <select
                        id="estadoProveedor"
                        className="select"
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                        <option value="todos">Todos</option>
                        <option value="activos">Activos</option>
                        <option value="inactivos">Inactivos</option>
                    </select>
                </div>

                <button
                    type="button"
                    className="btn btn--ghost btn--md"
                    onClick={onLimpiarFiltros}
                >
                    Limpiar
                </button>
            </div>
        </div>
    );
}

export default FiltroProveedores;