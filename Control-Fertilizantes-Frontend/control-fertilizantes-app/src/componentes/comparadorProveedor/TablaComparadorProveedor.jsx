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
    <div className="tabla-comparador-card">
      <div className="tabla-comparador-card__encabezado">
        <div>
          <h2>Comparativa de proveedores</h2>
          <p>
            Analice el comportamiento histórico de cada proveedor y compare cuál
            representa la mejor opción de compra.
          </p>
        </div>
      </div>

      <div className="tabla-responsive">
        <table className="tabla-comparador">
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
                  <div className="celda-proveedor-comparador">
                    <div className="celda-proveedor-comparador__nombre">
                      {proveedor.nombreProveedor}
                    </div>

                    <div className="celda-proveedor-comparador__badges">
                      {proveedor.esMejorPrecio && (
                        <span className="badge-comparador badge-comparador--mejor-precio">
                          Mejor precio
                        </span>
                      )}

                      {proveedor.esMasEstable && (
                        <span className="badge-comparador badge-comparador--mas-estable">
                          Más estable
                        </span>
                      )}

                      {proveedor.esProveedorRecomendado && (
                        <span className="badge-comparador badge-comparador--recomendado">
                          Recomendado
                        </span>
                      )}
                    </div>

                    {proveedor.recomendacion && (
                      <div className="celda-proveedor-comparador__texto">
                        {proveedor.recomendacion}
                      </div>
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
                        ? "texto-variacion texto-variacion--favorable"
                        : "texto-variacion texto-variacion--desfavorable"
                    }
                  >
                    {Number(proveedor.diferenciaVsPromedioPorcentual ?? 0).toFixed(2)}%
                  </span>
                </td>

                <td>
                  <span className={obtenerClaseTendencia(proveedor.tendencia)}>
                    {proveedor.tendencia || "Sin referencia"}
                  </span>
                </td>

                <td>
                  <span className="puntaje-comparador">
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
                    className="boton-tabla-detalle"
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
  );
}

export default TablaComparadorProveedor;