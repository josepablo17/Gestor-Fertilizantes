function ResumenInteligenteCompras({ resumen }) {
  if (!resumen) {
    return (
      <div className="estado-vacio-modulo resumen-inteligente-vacio">
        Selecciona un producto y una presentación para ver el análisis inteligente.
      </div>
    );
  }

  const claseTendencia = obtenerClaseTendencia(resumen.tendenciaGeneral);
  const claseVariacionPromedio = obtenerClaseVariacion(resumen.porcentajeVariacionVsPromedio);

  const posicionPrecio = obtenerPosicionPrecio(
    resumen.ultimoPrecioUnitario,
    resumen.precioMinimoHistorico,
    resumen.precioMaximoHistorico
  );

  const insightHistorico = obtenerInsightHistorico(resumen);

  return (
    <section className="resumen-inteligente-seccion">
      <div className="encabezado-resumen-inteligente">
        <div>
          <h3>Panorama histórico del precio</h3>
          <p>
            Este resumen muestra cómo se comporta el precio dentro de su historial para ayudarte a contextualizar la evaluación.
          </p>
        </div>
      </div>

      <div className="resumen-inteligente-insight">
        <span className="resumen-inteligente-insight-etiqueta">
          Lectura rápida del histórico
        </span>
        <p className="resumen-inteligente-insight-texto">
          {insightHistorico}
        </p>
      </div>

      <div className="resumen-inteligente">
        <article className="card-base card-resumen-inteligente card-kpi-hero card-kpi-hero-principal">
          <div className="card-resumen-superior">
            <span className="card-resumen-etiqueta">Promedio histórico</span>
            <span className="card-resumen-chip">Referencia</span>
          </div>

          <div className="card-resumen-cuerpo">
            <h3 className="card-resumen-valor">
              {formatearMoneda(resumen.precioPromedioHistorico)}
            </h3>
            <p className="card-resumen-extra">
              Valor de referencia construido a partir del historial disponible.
            </p>
          </div>
        </article>

        <article className="card-base card-resumen-inteligente card-kpi-hero">
          <div className="card-resumen-superior">
            <span className="card-resumen-etiqueta">Precio actual</span>
            <span className="card-resumen-chip">Último registro</span>
          </div>

          <div className="card-resumen-cuerpo">
            <h3 className="card-resumen-valor">
              {formatearMoneda(resumen.ultimoPrecioUnitario)}
            </h3>
            <p className="card-resumen-extra">
              Precio unitario observado en la compra más reciente.
            </p>
          </div>
        </article>

        <article className="card-base card-resumen-inteligente card-kpi-variacion">
          <span className="card-resumen-etiqueta">Posición frente al promedio</span>
          <h3 className={`card-resumen-valor ${claseVariacionPromedio}`}>
            {formatearPorcentaje(resumen.porcentajeVariacionVsPromedio)}
          </h3>
          <p className="card-resumen-extra">
            Diferencia del precio actual con respecto a la referencia histórica.
          </p>
        </article>

        <article className="card-base card-resumen-inteligente card-kpi-tendencia">
          <span className="card-resumen-etiqueta">Tendencia histórica</span>
          <div className="card-resumen-tendencia-wrap">
            <span className={`badge-tendencia ${claseTendencia}`}>
              {resumen.tendenciaGeneral || "Sin dato"}
            </span>
          </div>
          <p className="card-resumen-extra">
            Dirección predominante observada en el comportamiento reciente del precio.
          </p>
        </article>

        <article className="card-base card-resumen-inteligente card-kpi-secundario">
          <span className="card-resumen-etiqueta">Registros analizados</span>
          <h3 className="card-resumen-valor">
            {formatearNumeroEntero(resumen.cantidadCompras)}
          </h3>
          <p className="card-resumen-extra">
            Cantidad de compras utilizadas para respaldar el análisis.
          </p>
        </article>

        <article className="card-base card-resumen-inteligente card-kpi-secundario">
          <span className="card-resumen-etiqueta">Piso histórico</span>
          <h3 className="card-resumen-valor">
            {formatearMoneda(resumen.precioMinimoHistorico)}
          </h3>
          <p className="card-resumen-extra">
            Valor mínimo registrado en el historial del producto.
          </p>
        </article>

        <article className="card-base card-resumen-inteligente card-kpi-secundario">
          <span className="card-resumen-etiqueta">Techo histórico</span>
          <h3 className="card-resumen-valor">
            {formatearMoneda(resumen.precioMaximoHistorico)}
          </h3>
          <p className="card-resumen-extra">
            Valor máximo registrado dentro del histórico disponible.
          </p>
        </article>

        <article className="card-base card-resumen-inteligente card-kpi-secundario">
          <span className="card-resumen-etiqueta">Posición en el rango</span>
          <h3 className="card-resumen-valor">
            {posicionPrecio}
          </h3>
          <p className="card-resumen-extra">
            Ubicación estimada del precio actual entre el mínimo y el máximo histórico.
          </p>
        </article>
      </div>
    </section>
  );
}

function obtenerInsightHistorico(resumen) {
  const cantidadCompras = Number(resumen.cantidadCompras);
  const promedio = Number(resumen.precioPromedioHistorico);
  const actual = Number(resumen.ultimoPrecioUnitario);
  const minimo = Number(resumen.precioMinimoHistorico);
  const maximo = Number(resumen.precioMaximoHistorico);
  const tendencia = resumen.tendenciaGeneral || "sin tendencia definida";

  const rangoValido =
    !isNaN(minimo) &&
    !isNaN(maximo) &&
    maximo > minimo;

  let posicionTexto = "sin posición calculable";

  if (rangoValido && !isNaN(actual)) {
    const posicion = ((actual - minimo) / (maximo - minimo)) * 100;

    if (posicion <= 33) {
      posicionTexto = "en la zona baja del rango histórico";
    } else if (posicion <= 66) {
      posicionTexto = "en una zona media del rango histórico";
    } else {
      posicionTexto = "en la zona alta del rango histórico";
    }
  }

  if (!isNaN(cantidadCompras) && cantidadCompras <= 2) {
    return `El análisis se construye con pocos registros y debe interpretarse con cautela. Aun así, el precio actual se ubica ${posicionTexto}, con una tendencia ${tendencia}.`;
  }

  if (!isNaN(actual) && !isNaN(promedio)) {
    if (actual < promedio) {
      return `El precio actual se mantiene por debajo del promedio histórico y se ubica ${posicionTexto}. La tendencia general observada es ${tendencia}.`;
    }

    if (actual > promedio) {
      return `El precio actual se encuentra por encima del promedio histórico y se ubica ${posicionTexto}. La tendencia general observada es ${tendencia}.`;
    }
  }

  return `El comportamiento histórico muestra una tendencia ${tendencia}, y el precio actual se ubica ${posicionTexto}.`;
}

function obtenerPosicionPrecio(actual, minimo, maximo) {
  const valorActual = Number(actual);
  const valorMinimo = Number(minimo);
  const valorMaximo = Number(maximo);

  if (
    isNaN(valorActual) ||
    isNaN(valorMinimo) ||
    isNaN(valorMaximo) ||
    valorMaximo <= valorMinimo
  ) {
    return "N/A";
  }

  const posicion = ((valorActual - valorMinimo) / (valorMaximo - valorMinimo)) * 100;
  const posicionNormalizada = Math.max(0, Math.min(100, posicion));

  return `${posicionNormalizada.toFixed(0)}%`;
}

function formatearMoneda(valor) {
  if (valor === null || valor === undefined) return "N/A";

  return Number(valor).toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatearNumeroEntero(valor) {
  if (valor === null || valor === undefined) return "N/A";

  return Number(valor).toLocaleString("es-CR", {
    maximumFractionDigits: 0
  });
}

function formatearPorcentaje(valor) {
  if (valor === null || valor === undefined) return "N/A";

  return `${Number(valor).toFixed(2)}%`;
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

function obtenerClaseVariacion(valor) {
  if (valor === null || valor === undefined) return "variacion-neutral";
  if (Number(valor) > 0) return "variacion-alza";
  if (Number(valor) < 0) return "variacion-baja";
  return "variacion-neutral";
}

export default ResumenInteligenteCompras;