function TablaHistorialPrecios({ historial }) {
  if (!historial || historial.length === 0) {
    return (
      <div className="estado-vacio-modulo">
        No hay contexto inteligente disponible para los filtros seleccionados.
      </div>
    );
  }

  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h3 className="card__title">Contexto inteligente del historial de precios</h3>
          <p className="card__subtitle">
            Compras clave seleccionadas automáticamente para interpretar mejor
            la evolución del precio.
          </p>
        </div>
      </div>

      <div className="card__body">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Insight</th>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Cantidad</th>
                <th>Precio total</th>
                <th>Precio unitario</th>
                <th>Precio anterior</th>
                <th>Diferencia</th>
                <th>% cambio</th>
                <th>Tendencia</th>
              </tr>
            </thead>

            <tbody>
              {historial.map((item, index) => {
                const claseDiferencia = obtenerClaseVariacion(item.diferenciaPrecio);
                const clasePorcentaje = obtenerClaseVariacion(item.porcentajeCambioPrecio);
                const claseTendencia = obtenerClaseTendencia(item.tendenciaPrecio);
                const claseInsight = obtenerClaseInsight(item.insight);

                return (
                  <tr key={item.idCompra ?? `${item.fechaCompra}-${index}`}>
                    <td>
                      <span className={`badge ${claseInsight}`}>
                        {item.insight || "Compra relevante"}
                      </span>
                    </td>

                    <td>
                      <span className="table__cell-muted">
                        {formatearFecha(item.fechaCompra)}
                      </span>
                    </td>

                    <td>
                      <span className="table__cell-strong">
                        {item.nombreProveedor || "N/A"}
                      </span>
                    </td>

                    <td>
                      <span className="table__cell-muted">
                        {formatearNumero(item.cantidadComprada)}
                      </span>
                    </td>

                    <td>
                      <span className="table__cell-muted">
                        {formatearMoneda(item.precioTotal)}
                      </span>
                    </td>

                    <td>
                      <span className="table__cell-strong">
                        {formatearMoneda(item.precioUnitarioCalculado)}
                      </span>
                    </td>

                    <td>
                      <span className="table__cell-muted">
                        {formatearMoneda(item.precioUnitarioAnterior)}
                      </span>
                    </td>

                    <td>
                      <span className={claseDiferencia}>
                        {formatearMoneda(item.diferenciaPrecio)}
                      </span>
                    </td>

                    <td>
                      <span className={clasePorcentaje}>
                        {formatearPorcentaje(item.porcentajeCambioPrecio)}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${claseTendencia}`}>
                        {item.tendenciaPrecio || "Sin dato"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function formatearFecha(fecha) {
  if (!fecha) return "N/A";

  return new Date(fecha).toLocaleDateString("es-CR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

function formatearNumero(valor) {
  if (valor === null || valor === undefined) return "N/A";

  return Number(valor).toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatearMoneda(valor) {
  if (valor === null || valor === undefined) return "N/A";

  return Number(valor).toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatearPorcentaje(valor) {
  if (valor === null || valor === undefined) return "N/A";

  return `${Number(valor).toFixed(2)}%`;
}

function obtenerClaseVariacion(valor) {
  if (valor === null || valor === undefined) return "variacion-neutral";
  if (Number(valor) > 0) return "variacion-alza";
  if (Number(valor) < 0) return "variacion-baja";
  return "variacion-neutral";
}

function obtenerClaseTendencia(tendencia) {
  if (!tendencia) return "tendencia-neutral";

  const valor = tendencia.toLowerCase();

  if (valor.includes("al alza")) return "tendencia-alza";
  if (valor.includes("aumento")) return "tendencia-alza";
  if (valor.includes("a la baja")) return "tendencia-baja";
  if (valor.includes("dismin")) return "tendencia-baja";
  if (valor.includes("estable")) return "tendencia-estable";
  if (valor.includes("sin cambio")) return "tendencia-estable";

  return "tendencia-neutral";
}

function obtenerClaseInsight(insight) {
  if (!insight) return "insight-neutral";

  const valor = insight.toLowerCase();

  if (valor.includes("más reciente")) return "insight-reciente";
  if (valor.includes("más alto")) return "insight-alza";
  if (valor.includes("más bajo")) return "insight-baja";
  if (valor.includes("mayor variación")) return "insight-variacion";
  if (valor.includes("primer registro")) return "insight-origen";

  return "insight-neutral";
}

export default TablaHistorialPrecios;