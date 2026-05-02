function AlertasCompra({ alertas }) {
  if (!alertas || alertas.length === 0) {
    return (
      <div className="estado-vacio-modulo">
        No se encontraron alertas para los filtros seleccionados.
      </div>
    );
  }

  const alertasOrdenadas = [...alertas].sort((a, b) => {
    const nivelA = obtenerPesoNivel(a.Nivel ?? a.nivel);
    const nivelB = obtenerPesoNivel(b.Nivel ?? b.nivel);
    return nivelB - nivelA;
  });

  const alertaPrincipal = alertasOrdenadas[0];
  const alertasSecundarias = alertasOrdenadas.slice(1);

return (
  <div className="compra-inteligencia__bloque">

    {/* Header */}
    <div className="card compra-inteligencia__panel">
      <div className="card__body compra-inteligencia__panel-header">
        <div>
          <h3 className="card__title">Riesgos y oportunidades detectadas</h3>
          <p className="card__subtitle">
            El sistema identificó situaciones que pueden afectar tus decisiones de compra.
          </p>
        </div>

        <span className="badge badge--neutral compra-inteligencia__badge-total">
          {alertasOrdenadas.length} alerta{alertasOrdenadas.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>

    {/* Alerta principal */}
    {alertaPrincipal && (() => {
      const tipo = alertaPrincipal.TipoAlerta ?? alertaPrincipal.tipoAlerta;
      const nivel = alertaPrincipal.Nivel ?? alertaPrincipal.nivel;
      const mensaje = alertaPrincipal.Mensaje ?? alertaPrincipal.mensaje;
      const valor = alertaPrincipal.ValorReferencia ?? alertaPrincipal.valorReferencia;

      const claseNivel = obtenerClaseNivel(nivel);
      const insight = obtenerInsightCorto(tipo, nivel);
      const recomendacion = obtenerRecomendacion(tipo, nivel);

      return (
        <div className={`card card--highlight compra-inteligencia__alerta-principal ${claseNivel}`}>
          <div className="card__body">

            {/* Encabezado */}
            <div className="compra-inteligencia__alerta-principal-encabezado">
              <span className="label">
                {formatearTipoAlerta(tipo)}
              </span>

              <span className={`badge ${claseNivel}`}>
                {nivel || "N/A"}
              </span>
            </div>

            {/* 💥 Insight principal */}
            <div className="compra-inteligencia__alerta-principal-contenido">
              <h3 className="card__title compra-inteligencia__alerta-titulo">
                {insight}
              </h3>

              <p className="text-muted">
                {mensaje || "Sin descripción disponible."}
              </p>
            </div>

            {/* Acción */}
            <div className="compra-inteligencia__alerta-principal-accion">
              <div className="alert alert--warning compra-inteligencia__alerta-accion">
                <strong>Acción sugerida:</strong>
                <p>{recomendacion}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="compra-inteligencia__alerta-principal-footer">
              <span>Valor de referencia</span>
              <strong className="compra-inteligencia__alerta-valor">
                {formatearValor(valor)}
              </strong>
            </div>

          </div>
        </div>
      );
    })()}

    {/* Alertas secundarias */}
    {alertasSecundarias.length > 0 && (
      <div className="compra-inteligencia__alertas-grid">
        {alertasSecundarias.map((alerta, index) => {
          const tipo = alerta.TipoAlerta ?? alerta.tipoAlerta;
          const nivel = alerta.Nivel ?? alerta.nivel;

          const claseNivel = obtenerClaseNivel(nivel);
          const insight = obtenerInsightCorto(tipo, nivel);

          return (
            <div
              key={index}
              className={`card compra-inteligencia__alerta-card ${claseNivel}`}
            >
              <div className="card__body">

                <div className="compra-inteligencia__alerta-card-header">
                  <span className="label">
                    {formatearTipoAlerta(tipo)}
                  </span>

                  <span className={`badge ${claseNivel}`}>
                    {nivel || "N/A"}
                  </span>
                </div>

                <h4 className="compra-inteligencia__alerta-card-titulo">
                  {insight}
                </h4>

              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
}

function obtenerPesoNivel(nivel) {
  if (!nivel) return 0;

  const valor = nivel.toLowerCase();

  if (valor.includes("alto")) return 3;
  if (valor.includes("medio")) return 2;
  if (valor.includes("bajo")) return 1;

  return 0;
}

function obtenerClaseNivel(nivel) {
  if (!nivel) return "alerta-neutral";

  const valor = nivel.toLowerCase();

  if (valor.includes("alto")) return "alerta-alta";
  if (valor.includes("medio")) return "alerta-media";
  if (valor.includes("bajo")) return "alerta-baja";

  return "alerta-neutral";
}

function obtenerInsightCorto(tipo, nivel) {
  const tipoNormalizado = (tipo || "").toLowerCase();
  const nivelNormalizado = (nivel || "").toLowerCase();

  if (tipoNormalizado === "sobreprecio") {
    return nivelNormalizado.includes("alto")
      ? "El precio actual muestra una desviación importante."
      : "El precio actual merece seguimiento frente al historial.";
  }

  if (tipoNormalizado === "subidareciente") {
    return nivelNormalizado.includes("alto")
      ? "Se detectó un aumento reciente que requiere atención."
      : "Se observa un cambio reciente en la evolución del precio.";
  }

  if (tipoNormalizado === "dependenciaproveedor") {
    return "La concentración de compras en un proveedor puede elevar el riesgo.";
  }

  if (tipoNormalizado === "inactividadcompra") {
    return "El historial reciente muestra poca actividad de compra.";
  }

  return "Se detectó una condición que puede impactar la decisión de compra.";
}

function obtenerRecomendacion(tipo, nivel) {
  const tipoNormalizado = (tipo || "").toLowerCase();
  const nivelNormalizado = (nivel || "").toLowerCase();

  if (tipoNormalizado === "sobreprecio") {
    if (nivelNormalizado.includes("alto")) {
      return "Se recomienda evaluar proveedores alternativos antes de realizar nuevas compras.";
    }

    return "Se recomienda monitorear el comportamiento del precio en próximas compras.";
  }

  if (tipoNormalizado === "subidareciente") {
    return "Se recomienda revisar si el aumento responde a una tendencia sostenida o a un evento puntual.";
  }

  if (tipoNormalizado === "dependenciaproveedor") {
    return "Se recomienda diversificar proveedores para reducir el riesgo operativo.";
  }

  if (tipoNormalizado === "inactividadcompra") {
    return "Se recomienda validar la necesidad actual del producto y revisar el stock disponible.";
  }

  return "Se recomienda analizar el contexto antes de tomar una decisión.";
}

function formatearTipoAlerta(tipo) {
  if (!tipo) return "Alerta";

  switch ((tipo || "").toLowerCase()) {
    case "sobreprecio":
      return "Sobreprecio";
    case "subidareciente":
      return "Subida reciente";
    case "dependenciaproveedor":
      return "Dependencia de proveedor";
    case "inactividadcompra":
      return "Inactividad de compra";
    default:
      return tipo;
  }
}

function formatearValor(valor) {
  if (valor === null || valor === undefined) return "N/A";

  return Number(valor).toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export default AlertasCompra;