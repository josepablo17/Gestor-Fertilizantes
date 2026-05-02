function EvaluacionCompra({ evaluacion }) {
  if (!evaluacion) {
    return (
      <div className="estado-vacio-modulo">
        No hay una compra reciente para evaluar.
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

  const recomendacionSistema = obtenerRecomendacionSistema(evaluacion);
  const observacionContextual = obtenerObservacionContextual(evaluacion);

return (
  <section className="compra-inteligencia__evaluacion">
    <div
      className={`compra-inteligencia__evaluacion-hero ${obtenerClaseEstadoCard(
        evaluacion.clasificacionCompra
      )}`}
    >
      <div className="compra-inteligencia__evaluacion-hero-top">
        <span className={`badge ${claseClasificacion}`}>
          {evaluacion.clasificacionCompra || "Sin clasificación"}
        </span>

        <span className="compra-inteligencia__evaluacion-eyebrow">
          Evaluación automática
        </span>
      </div>

      <div className="compra-inteligencia__evaluacion-hero-main">
        <div className="compra-inteligencia__evaluacion-hero-copy">
          <h2 className="compra-inteligencia__evaluacion-titulo">
            {tituloImpacto}
          </h2>

          <p className="compra-inteligencia__evaluacion-observacion">
            {observacionContextual}
          </p>
        </div>

        <div className="compra-inteligencia__evaluacion-impacto">
          <span
            className={`compra-inteligencia__evaluacion-impacto-valor ${claseVariacionPromedio}`}
          >
            {formatearPorcentaje(evaluacion.porcentajeVsPromedio)}
          </span>
          <span className="compra-inteligencia__evaluacion-impacto-label">
            vs promedio histórico
          </span>
        </div>
      </div>

      <div className="compra-inteligencia__evaluacion-accion">
        <strong>Acción sugerida</strong>
        <p>{recomendacionSistema}</p>
      </div>
    </div>

    <div className="compra-inteligencia__evaluacion-resumen">
      <div className="compra-inteligencia__evaluacion-panel">
        <div className="compra-inteligencia__evaluacion-panel-header">
          <h3>Referencia económica</h3>
          <p>Comparación del precio actual contra el histórico.</p>
        </div>

        <div className="compra-inteligencia__evaluacion-grid">
          <div className="compra-inteligencia__evaluacion-item">
            <span className="label">Precio actual</span>
            <strong>{formatearNumero(evaluacion.precioUnitarioActual)}</strong>
          </div>

          <div className="compra-inteligencia__evaluacion-item">
            <span className="label">Precio típico</span>
            <strong>{formatearNumero(evaluacion.precioPromedioHistorico)}</strong>
          </div>

          <div className="compra-inteligencia__evaluacion-item">
            <span className="label">Impacto vs histórico</span>
            <strong className={claseVariacionPromedio}>
              {formatearPorcentaje(evaluacion.porcentajeVsPromedio)}
            </strong>
          </div>
        </div>
      </div>

      <div className="compra-inteligencia__evaluacion-panel">
        <div className="compra-inteligencia__evaluacion-panel-header">
          <h3>Contexto de la compra</h3>
          <p>Información operativa del registro evaluado.</p>
        </div>

        <div className="compra-inteligencia__evaluacion-grid">
          <div className="compra-inteligencia__evaluacion-item">
            <span className="label">Proveedor</span>
            <strong>{evaluacion.nombreProveedor || "N/A"}</strong>
          </div>

          <div className="compra-inteligencia__evaluacion-item">
            <span className="label">Fecha</span>
            <strong>{formatearFecha(evaluacion.fechaCompra)}</strong>
          </div>

          <div className="compra-inteligencia__evaluacion-item">
            <span className="label">Tendencia</span>
            <div className="compra-inteligencia__evaluacion-badge">
              <span className={`badge ${claseTendencia}`}>
                {evaluacion.tendenciaPrecio || "Sin dato"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
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

function obtenerRecomendacionSistema(evaluacion) {
  const clasificacion = (evaluacion.clasificacionCompra || "").toLowerCase();
  const porcentajeVsPromedio = Number(evaluacion.porcentajeVsPromedio);
  const porcentajeVsUltimo = Number(evaluacion.porcentajeVsUltimo);
  const tendencia = (evaluacion.tendenciaPrecio || "").toLowerCase();

  if (clasificacion.includes("conveniente")) {
    if (!isNaN(porcentajeVsPromedio) && porcentajeVsPromedio < 0) {
      return "El precio actual se encuentra en una posición favorable frente al histórico. Puede mantenerse este criterio de compra mientras la tendencia no cambie de forma importante.";
    }

    return "La compra presenta condiciones favorables. Se recomienda mantener seguimiento del comportamiento del precio en próximas compras.";
  }

  if (clasificacion.includes("aceptable")) {
    if (!isNaN(porcentajeVsUltimo) && porcentajeVsUltimo > 0) {
      return "La compra se mantiene dentro de parámetros aceptables, pero conviene vigilar si el precio continúa aumentando en los próximos registros.";
    }

    return "La compra no presenta una señal crítica inmediata. Se recomienda continuar monitoreando el histórico antes de tomar una decisión correctiva.";
  }

  if (clasificacion.includes("riesgosa") || clasificacion.includes("cara")) {
    if (tendencia.includes("al alza") || tendencia.includes("aumento")) {
      return "Se recomienda revisar proveedores alternativos o replantear la próxima compra, ya que el precio actual está alto y además muestra una tendencia reciente al alza.";
    }

    if (!isNaN(porcentajeVsPromedio) && porcentajeVsPromedio > 0) {
      return "Se recomienda analizar esta compra con mayor cautela, porque el precio actual supera la referencia histórica y podría representar un sobrecosto.";
    }

    return "La compra presenta señales de riesgo. Conviene validar nuevamente condiciones, proveedor y referencia histórica antes de repetir este patrón de compra.";
  }

  return "No hay suficiente contexto para emitir una recomendación automática más específica.";
}

function obtenerObservacionContextual(evaluacion) {
  const proveedor = evaluacion.nombreProveedor || "Proveedor no especificado";
  const fecha = formatearFecha(evaluacion.fechaCompra);

  return `La evaluación corresponde a la compra registrada con ${proveedor} el ${fecha}.`;
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

function obtenerClaseEstadoCard(clasificacion) {
  if (!clasificacion) return "evaluacion-estado-neutral";

  const valor = clasificacion.toLowerCase();

  if (valor.includes("conveniente")) return "evaluacion-estado-bueno";
  if (valor.includes("aceptable")) return "evaluacion-estado-medio";
  if (valor.includes("riesgosa")) return "evaluacion-estado-riesgo";
  if (valor.includes("cara")) return "evaluacion-estado-riesgo";

  return "evaluacion-estado-neutral";
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