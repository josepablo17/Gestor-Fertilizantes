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
    <section className="filtros-compra-inteligencia">
      <div className="filtros-compra-header">
        <div className="filtros-compra-header-texto">
          <span className="filtros-kicker">Configuración del análisis</span>
          <h3>Selecciona el producto y la presentación a evaluar</h3>
          <p>
            Define el contexto del análisis para consultar precios históricos,
            tendencias, alertas y evaluación automática de compra.
          </p>
        </div>

        <div className="filtros-resumen">
          <span className="filtros-resumen-item">
            {cantidadProductos} producto{cantidadProductos !== 1 ? "s" : ""}
          </span>
          <span className="filtros-resumen-item">
            {cantidadPresentaciones} presentaci{cantidadPresentaciones !== 1 ? "ones" : "ón"}
          </span>
        </div>
      </div>

      <div className="barra-herramientas barra-herramientas-analisis">
        <div className="grupo-filtros grupo-filtros-analisis">
          <div className="campo-filtro-inteligente">
            <label className="label-filtro-inteligente">Producto</label>
            <select
              value={idProducto}
              onChange={manejarCambioProducto}
              className="select-filtro"
            >
              <option value="">Seleccione un producto</option>
              {productos.map((producto) => (
                <option key={producto.idProducto} value={producto.idProducto}>
                  {producto.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="campo-filtro-inteligente">
            <label className="label-filtro-inteligente">Presentación</label>
            <select
              value={idPresentacionProducto}
              onChange={(e) => setIdPresentacionProducto(e.target.value)}
              className="select-filtro"
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

        <div className="grupo-acciones-filtros">
          <button
            className="boton-base boton-limpiar boton-limpiar-analisis"
            onClick={onLimpiarFiltros}
            type="button"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </section>
  );
}

export default FiltrosCompraInteligencia;