function TablaHistorialPrecios({ historial }) {
  if (!historial || historial.length === 0) {
    return (
      <div className="estado-vacio-modulo tabla-historial-vacia">
        No hay historial de compras para los filtros seleccionados.
      </div>
    );
  }

  return (
    <section className="tabla-historial-seccion">
      <div className="card-base card-tabla-historial">
        <div className="encabezado-tabla-historial">
          <div>
            <h3>Historial de compras</h3>
            <p>
              Registro detallado de precios y variaciones entre compras realizadas.
            </p>
          </div>
        </div>

        <div className="tabla-responsive">
          <table className="tabla-modulo tabla-historial-precios">
            <thead>
              <tr>
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
              {historial.map((item) => {
                const claseDiferencia = obtenerClaseVariacion(item.diferenciaPrecio);
                const clasePorcentaje = obtenerClaseVariacion(item.porcentajeCambioPrecio);
                const claseTendencia = obtenerClaseTendencia(item.tendenciaPrecio);

                return (
                  <tr key={item.idCompra}>
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
  if (valor.includes("a la baja")) return "tendencia-baja";
  if (valor.includes("estable")) return "tendencia-estable";

  return "tendencia-neutral";
}

export default TablaHistorialPrecios;