function TablaCompras({ compras, onEditar }) {
  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "Sin fecha";
    }

    return new Date(fecha).toLocaleDateString("es-CR");
  };

  const formatearMonto = (monto, moneda) => {
    if (monto === null || monto === undefined || monto === "") {
      return "No disponible";
    }

    return `${moneda || ""} ${Number(monto).toFixed(2)}`.trim();
  };

  return (
    <div className="tabla-responsive">
      <table className="tabla-modulo">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Proveedor</th>
            <th>Presentación</th>
            <th>Fecha</th>
            <th>Cantidad</th>
            <th>Precio total</th>
            <th>Precio unitario</th>
            <th>Tendencia</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {compras.map((compra) => (
            <tr key={compra.idCompra}>
              <td>
                <div className="celda-principal">
                  <span className="texto-principal">
                    {compra.nombreProducto || "Sin producto"}
                  </span>
                  <span className="texto-secundario">
                    {compra.categoria || "Sin categoría"} • {compra.marca || "Sin marca"}
                  </span>
                </div>
              </td>

              <td>
                <span className="texto-secundario">
                  {compra.nombreProveedor || "Sin proveedor"}
                </span>
              </td>

              <td>
                <div className="celda-principal">
                  <span className="texto-principal">
                    {compra.presentacion || "Sin presentación"}
                  </span>
                  <span className="texto-secundario">
                    {compra.cantidadPresentacion || "0"} {compra.unidadMedida || ""}
                  </span>
                </div>
              </td>

              <td>
                <span className="texto-secundario">
                  {formatearFecha(compra.fechaCompra)}
                </span>
              </td>

              <td>
                <span className="texto-secundario">
                  {compra.cantidadComprada ?? "0"}
                </span>
              </td>

              <td>
                <span className="texto-secundario">
                  {formatearMonto(compra.precioTotal, compra.moneda)}
                </span>
              </td>

              <td>
                <span className="texto-secundario">
                  {formatearMonto(compra.precioUnitarioCalculado, compra.moneda)}
                </span>
              </td>

              <td>
                <span
                  className={`estado-badge ${
                    compra.tendenciaPrecio?.toLowerCase() === "subió"
                      ? "estado-inactivo"
                      : compra.tendenciaPrecio?.toLowerCase() === "bajó"
                      ? "estado-activo"
                      : "estado-pendiente"
                  }`}
                >
                  <span className="punto-estado"></span>
                  {compra.tendenciaPrecio || "Sin tendencia"}
                </span>
              </td>

              <td>
                <div className="acciones-tabla">
                  <button
                    className="boton-base boton-tabla boton-editar"
                    onClick={() => onEditar(compra)}
                    type="button"
                  >
                    Editar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaCompras;