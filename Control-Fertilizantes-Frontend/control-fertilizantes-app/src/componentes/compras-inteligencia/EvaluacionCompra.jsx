function EvaluacionCompra({ evaluacion }) {
  if (!evaluacion) {
    return (
      <div className="estado-vacio-modulo evaluacion-compra-vacia">
        No hay una compra reciente disponible para evaluar automáticamente.
      </div>
    );
  }

  const claseClasificacion = obtenerClaseClasificacion(evaluacion.clasificacionCompra);
  const claseVariacionPromedio = obtenerClaseVariacion(evaluacion.porcentajeVsPromedio);
  const claseVariacionUltimo = obtenerClaseVariacion(evaluacion.porcentajeVsUltimo);
  const claseTendencia = obtenerClaseTendencia(evaluacion.tendenciaPrecio);

  const tituloImpacto = obtenerTituloImpacto(
    evaluacion.clasificacionCompra,
    evaluacion.porcentajeVsPromedio
  );

  const subtituloImpacto = obtenerSubtituloImpacto(evaluacion);

  return (
    <section className="evaluacion-compra-seccion">
      <article className="card-base card-evaluacion-compra card-evaluacion-destacada">
        <div className="evaluacion-capa-brillo"></div>

        <div className="encabezado-evaluacion-compra">
          <div className="evaluacion-bloque-principal">
            <div className="evaluacion-superior">
              <span className="evaluacion-etiqueta">
                Evaluación automática de la compra más reciente
              </span>

              <span className={`evaluacion-badge ${claseClasificacion}`}>
                {evaluacion.clasificacionCompra || "Sin clasificación"}
              </span>
            </div>

            <div className="evaluacion-identidad">
              <span className="evaluacion-contexto">
                {evaluacion.nombreProducto || "Producto"} · {evaluacion.nombrePresentacion || "Presentación"}
              </span>

              <h2 className="evaluacion-titulo-impacto">
                {tituloImpacto}
              </h2>

              <p className="evaluacion-subtitulo-impacto">
                {subtituloImpacto}
              </p>
            </div>
          </div>
        </div>

        <div className="evaluacion-highlight-grid">
          <div className="evaluacion-highlight-card">
            <span className="evaluacion-highlight-etiqueta">Precio actual</span>
            <strong className="evaluacion-highlight-valor">
              {formatearNumero(evaluacion.precioUnitarioActual)}
            </strong>
          </div>

          <div className="evaluacion-highlight-card">
            <span className="evaluacion-highlight-etiqueta">Promedio histórico</span>
            <strong className="evaluacion-highlight-valor">
              {formatearNumero(evaluacion.precioPromedioHistorico)}
            </strong>
          </div>

          <div className="evaluacion-highlight-card">
            <span className="evaluacion-highlight-etiqueta">Variación vs promedio</span>
            <strong className={`evaluacion-highlight-valor ${claseVariacionPromedio}`}>
              {formatearPorcentaje(evaluacion.porcentajeVsPromedio)}
            </strong>
          </div>

          <div className="evaluacion-highlight-card">
            <span className="evaluacion-highlight-etiqueta">Tendencia reciente</span>
            <strong className={`evaluacion-highlight-valor ${claseTendencia}`}>
              {evaluacion.tendenciaPrecio || "Sin dato"}
            </strong>
          </div>
        </div>

        <div className="evaluacion-detalles-bloque">
          <div className="evaluacion-detalles-encabezado">
            <h3>Contexto de la compra evaluada</h3>
            <p>
              Datos de respaldo utilizados para interpretar la compra más reciente.
            </p>
          </div>

          <div className="evaluacion-detalles-grid">
            <div className="evaluacion-item">
              <span className="evaluacion-item-etiqueta">Proveedor</span>
              <strong className="evaluacion-item-valor">
                {evaluacion.nombreProveedor || "N/A"}
              </strong>
            </div>

            <div className="evaluacion-item">
              <span className="evaluacion-item-etiqueta">Fecha de compra</span>
              <strong className="evaluacion-item-valor">
                {formatearFecha(evaluacion.fechaCompra)}
              </strong>
            </div>

            <div className="evaluacion-item">
              <span className="evaluacion-item-etiqueta">Variación vs último precio</span>
              <strong className={`evaluacion-item-valor ${claseVariacionUltimo}`}>
                {formatearPorcentaje(evaluacion.porcentajeVsUltimo)}
              </strong>
            </div>

            <div className="evaluacion-item">
              <span className="evaluacion-item-etiqueta">Resultado del análisis</span>
              <strong className="evaluacion-item-valor">
                {evaluacion.mensajeEvaluacion || "Sin observación disponible"}
              </strong>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

function obtenerTituloImpacto(clasificacionCompra, porcentajeVsPromedio) {
  const clasificacion = (clasificacionCompra || "").toLowerCase();
  const porcentaje = Number(porcentajeVsPromedio);

  if (clasificacion.includes("conveniente")) {
    if (!isNaN(porcentaje) && porcentaje < 0) {
      return `Compra favorable: ${Math.abs(porcentaje).toFixed(2)}% por debajo del promedio histórico`;
    }
    return "Compra favorable frente al comportamiento histórico";
  }

  if (clasificacion.includes("aceptable")) {
    if (!isNaN(porcentaje)) {
      return `Compra aceptable con una variación de ${porcentaje.toFixed(2)}% frente al promedio`;
    }
    return "Compra aceptable dentro del comportamiento histórico";
  }

  if (clasificacion.includes("riesgosa") || clasificacion.includes("cara")) {
    if (!isNaN(porcentaje) && porcentaje > 0) {
      return `Atención: compra ${porcentaje.toFixed(2)}% por encima del promedio histórico`;
    }
    return "Atención: compra con señales de sobrecosto";
  }

  return clasificacionCompra || "Evaluación de compra disponible";
}

function obtenerSubtituloImpacto(evaluacion) {
  const proveedor = evaluacion.nombreProveedor || "Proveedor no especificado";
  const fecha = formatearFecha(evaluacion.fechaCompra);
  const tendencia = evaluacion.tendenciaPrecio || "Sin tendencia definida";

  return `Proveedor evaluado: ${proveedor}. Fecha analizada: ${fecha}. Tendencia detectada: ${tendencia}.`;
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

function formatearPorcentaje(valor) {
  if (valor === null || valor === undefined) return "N/A";

  return `${Number(valor).toFixed(2)}%`;
}

function obtenerClaseClasificacion(clasificacion) {
  if (!clasificacion) return "clasificacion-neutral";

  const valor = clasificacion.toLowerCase();

  if (valor.includes("conveniente")) return "clasificacion-buena";
  if (valor.includes("aceptable")) return "clasificacion-media";
  if (valor.includes("riesgosa")) return "clasificacion-alta";
  if (valor.includes("cara")) return "clasificacion-alta";

  return "clasificacion-neutral";
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

export default EvaluacionCompra;