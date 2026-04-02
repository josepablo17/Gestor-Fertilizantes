function TablaHistorialPrecios({ historial }) {
  if (!historial || historial.length === 0) {
    return (
      <div className="estado-vacio-modulo tabla-historial-vacia">
        No hay contexto inteligente disponible para los filtros seleccionados.
      </div>
    );
  }

  return (
    <section className="tabla-historial-seccion">
      <div className="card-base card-tabla-historial">
        <div className="encabezado-tabla-historial">
          <div>
            <h3>Contexto inteligente del historial de precios</h3>
            <p>
              Compras clave seleccionadas automáticamente para interpretar mejor
              la evolución del precio.
            </p>
          </div>
        </div>

        <div className="tabla-responsive">
          <table className="tabla-modulo tabla-historial-precios">
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
                  <tr
                    key={item.idCompra ?? `${item.fechaCompra}-${index}`}
                    className={claseInsight}
                  >
                    <td>
                      <span className={`badge-insight-tabla ${claseInsight}`}>
                        {item.insight || "Compra relevante"}
                      </span>
                    </td>

                    <td className="celda-fecha">
                      {formatearFecha(item.fechaCompra)}
                    </td>

                    <td className="celda-proveedor">
                      <span className="proveedor-nombre">
                        {item.nombreProveedor || "N/A"}
                      </span>
                    </td>

                    <td>{formatearNumero(item.cantidadComprada)}</td>

                    <td>{formatearMoneda(item.precioTotal)}</td>

                    <td className="celda-precio-unitario">
                      <strong>{formatearMoneda(item.precioUnitarioCalculado)}</strong>
                    </td>

                    <td>{formatearMoneda(item.precioUnitarioAnterior)}</td>

                    <td>
                      <span className={`valor-variacion ${claseDiferencia}`}>
                        {formatearMoneda(item.diferenciaPrecio)}
                      </span>
                    </td>

                    <td>
                      <span className={`valor-variacion ${clasePorcentaje}`}>
                        {formatearPorcentaje(item.porcentajeCambioPrecio)}
                      </span>
                    </td>

                    <td>
                      <span className={`badge-tendencia ${claseTendencia}`}>
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