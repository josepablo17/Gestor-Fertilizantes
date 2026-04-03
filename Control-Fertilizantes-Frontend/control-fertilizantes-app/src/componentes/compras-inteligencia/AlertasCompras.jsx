function AlertasCompra({ alertas }) {
  if (!alertas || alertas.length === 0) {
    return (
      <div className="estado-vacio-modulo alertas-compra-vacias">
        No se encontraron alertas para el producto y presentación seleccionados.
      </div>
    );
  }

  const alertasOrdenadas = [...alertas].sort((a, b) => {
    const nivelA = obtenerPesoNivel(a.Nivel ?? a.nivel);
    const nivelB = obtenerPesoNivel(b.Nivel ?? b.nivel);
    return nivelB - nivelA;
  });

  return (
    <section className="seccion-alertas-compra">
      <div className="encabezado-alertas-compra">
        <div>
          <h3>Alertas y apoyo a decisiones</h3>
          <p>
            Señales automáticas detectadas a partir del comportamiento histórico de compras.
          </p>
        </div>

        <div className="alertas-resumen-badge">
          {alertasOrdenadas.length} alerta{alertasOrdenadas.length !== 1 ? "s" : ""} detectada
          {alertasOrdenadas.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid-alertas-compra">
        {alertasOrdenadas.map((alerta, index) => {
          const tipoAlerta = alerta.TipoAlerta ?? alerta.tipoAlerta;
          const nivelAlerta = alerta.Nivel ?? alerta.nivel;
          const mensajeAlerta = alerta.Mensaje ?? alerta.mensaje;
          const valorReferencia = alerta.ValorReferencia ?? alerta.valorReferencia;

          const claseNivel = obtenerClaseNivel(nivelAlerta);
          const textoInsight = obtenerInsightCorto(tipoAlerta, nivelAlerta);
          const recomendacion = obtenerRecomendacion(tipoAlerta, nivelAlerta);

          return (
            <article
              key={`${tipoAlerta}-${index}`}
              className={`card-base card-alerta-compra ${claseNivel}`}
            >
              <div className="alerta-franja-superior"></div>

              <div className="alerta-compra-superior">
                <div className="alerta-encabezado-texto">
                  <span className="alerta-kicker">Señal detectada</span>
                  <span className="alerta-tipo">
                    {formatearTipoAlerta(tipoAlerta)}
                  </span>
                </div>

                <span className={`alerta-badge ${claseNivel}`}>
                  Riesgo {nivelAlerta || "sin nivel"}
                </span>
              </div>

              <div className="alerta-cuerpo">
                <h4 className="alerta-insight">
                  {textoInsight}
                </h4>

                <p className="alerta-mensaje">
                  {mensajeAlerta || "No hay descripción disponible para esta alerta."}
                </p>

                <div className="alerta-recomendacion">
                  <span className="alerta-recomendacion-etiqueta">
                    Recomendación
                  </span>
                  <p className="alerta-recomendacion-texto">
                    {recomendacion}
                  </p>
                </div>
              </div>

              <div className="alerta-footer">
                <div className="alerta-footer-bloque">
                  <span className="alerta-footer-etiqueta">Valor de referencia</span>
                  <strong className="alerta-footer-valor">
                    {formatearValor(valorReferencia)}
                  </strong>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
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