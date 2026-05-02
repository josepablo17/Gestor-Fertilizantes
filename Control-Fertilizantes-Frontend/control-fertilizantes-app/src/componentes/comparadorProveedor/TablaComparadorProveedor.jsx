function formatearMoneda(valor) {
  const numero = Number(valor ?? 0);

  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2
  }).format(numero);
}

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleDateString("es-CR");
}

function obtenerClaseEvaluacion(evaluacion) {
  switch (evaluacion?.toLowerCase()) {
    case "conveniente":
      return "badge-evaluacion badge-evaluacion--conveniente";
    case "aceptable":
      return "badge-evaluacion badge-evaluacion--aceptable";
    case "regular":
      return "badge-evaluacion badge-evaluacion--regular";
    case "riesgoso":
      return "badge-evaluacion badge-evaluacion--riesgoso";
    case "datos insuficientes":
      return "badge-evaluacion badge-evaluacion--insuficiente";
    default:
      return "badge-evaluacion";
  }
}

function obtenerClaseTendencia(tendencia) {
  switch (tendencia?.toLowerCase()) {
    case "a la baja":
      return "texto-tendencia texto-tendencia--baja";
    case "al alza":
      return "texto-tendencia texto-tendencia--alza";
    case "estable":
      return "texto-tendencia texto-tendencia--estable";
    default:
      return "texto-tendencia";
  }
}

function TablaComparadorProveedor({ proveedores = [], onVerDetalle }) {
  if (!proveedores.length) {
    return (
      <div className="tabla-comparador-vacia">
        No hay proveedores disponibles para mostrar.
      </div>
    );
  }

 return (
    <section className="card">
      <div className="card__header">
        <div className="stack" style={{ gap: "0.35rem" }}>
          <h2>Comparativa de proveedores</h2>
          <p className="text-muted">
            Analice el comportamiento histórico de cada proveedor y compare cuál
            representa la mejor opción de compra.
          </p>
        </div>
      </div>

      <div className="card__body">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Último precio</th>
                <th>Promedio histórico</th>
                <th>Última compra</th>
                <th>Compras</th>
                <th>Variación</th>
                <th>Dif. vs promedio</th>
                <th>Tendencia</th>
                <th>Puntaje</th>
                <th>Evaluación</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {proveedores.map((proveedor) => (
                <tr key={proveedor.idProveedor}>
                  <td>
                    <div className="stack" style={{ gap: "0.5rem" }}>
                      <div>{proveedor.nombreProveedor}</div>

                      <div
                        className="flex"
                        style={{ gap: "0.5rem", flexWrap: "wrap" }}
                      >
                        {proveedor.esMejorPrecio && (
                          <span className="badge text-success">Mejor precio</span>
                        )}

                        {proveedor.esMasEstable && (
                          <span className="badge">Más estable</span>
                        )}

                        {proveedor.esProveedorRecomendado && (
                          <span className="badge">Recomendado</span>
                        )}
                      </div>

                      {proveedor.recomendacion && (
                        <div className="text-muted">{proveedor.recomendacion}</div>
                      )}
                    </div>
                  </td>

                  <td>{formatearMoneda(proveedor.ultimoPrecioUnitario)}</td>

                  <td>{formatearMoneda(proveedor.promedioHistorico)}</td>

                  <td>{formatearFecha(proveedor.fechaUltimaCompra)}</td>

                  <td>{proveedor.cantidadCompras}</td>

                  <td>{Number(proveedor.variacionPorcentual ?? 0).toFixed(2)}%</td>

                  <td>
                    <span
                      className={
                        Number(proveedor.diferenciaVsPromedioPorcentual) <= 0
                          ? "text-success"
                          : "text-danger"
                      }
                    >
                      {Number(
                        proveedor.diferenciaVsPromedioPorcentual ?? 0
                      ).toFixed(2)}
                      %
                    </span>
                  </td>

                  <td>
                    <span className={obtenerClaseTendencia(proveedor.tendencia)}>
                      {proveedor.tendencia || "Sin referencia"}
                    </span>
                  </td>

                  <td>
                    <span className="badge">
                      {Number(proveedor.puntajeTotal ?? 0).toFixed(2)}
                    </span>
                  </td>

                  <td>
                    <span className={obtenerClaseEvaluacion(proveedor.evaluacion)}>
                      {proveedor.evaluacion || "Sin evaluación"}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => onVerDetalle(proveedor.idProveedor)}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default TablaComparadorProveedor;