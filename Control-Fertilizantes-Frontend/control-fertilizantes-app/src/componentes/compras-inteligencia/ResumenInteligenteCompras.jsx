function ResumenInteligenteCompras({ resumen }) {
  if (!resumen) {
    return (
      <div className="estado-vacio-modulo resumen-inteligente-vacio">
        Selecciona un producto y una presentación para ver el análisis inteligente.
      </div>
    );
  }

  const claseTendencia = obtenerClaseTendencia(resumen.tendenciaGeneral);

  const insightHistorico = obtenerInsightHistoricoResumen(resumen);
  const posicionPrecio = obtenerPosicionPrecio(
    resumen.ultimoPrecioUnitario,
    resumen.precioMinimoHistorico,
    resumen.precioMaximoHistorico
  );

  const lecturaBase = obtenerLecturaBase(resumen.cantidadCompras);
  const amplitudRango = obtenerAmplitudRango(
    resumen.precioMinimoHistorico,
    resumen.precioMaximoHistorico
  );

  return (
    <section className="resumen-inteligente-seccion">
      <div className="encabezado-resumen-inteligente">
        <div>
          <h3>Contexto histórico del precio</h3>
          <p>
            Esta vista explica qué tan amplio, estable y útil es el historial
            disponible para respaldar la evaluación.
          </p>
        </div>
      </div>

      <div className="resumen-inteligente-insight">
        <span className="resumen-inteligente-insight-etiqueta">
          Lectura del histórico
        </span>
        <p className="resumen-inteligente-insight-texto">
          {insightHistorico}
        </p>
      </div>

      <div className="resumen-inteligente--contexto">
        <article className="card-resumen-inteligente card-kpi-hero card-kpi-hero-principal">
          <div className="card-resumen-superior">
            <span className="card-resumen-etiqueta">Base del análisis</span>
            <span className="card-resumen-chip">Confiabilidad</span>
          </div>

          <div className="card-resumen-cuerpo">
            <h3 className="card-resumen-valor">
              {formatearNumeroEntero(resumen.cantidadCompras)} registros
            </h3>
            <p className="card-resumen-extra">{lecturaBase}</p>
          </div>
        </article>

        <article className="card-resumen-inteligente card-kpi-hero">
          <div className="card-resumen-superior">
            <span className="card-resumen-etiqueta">Rango histórico</span>
            <span className="card-resumen-chip">Min - Max</span>
          </div>

          <div className="card-resumen-cuerpo">
            <h3 className="card-resumen-valor">
              {formatearMoneda(resumen.precioMinimoHistorico)} -{" "}
              {formatearMoneda(resumen.precioMaximoHistorico)}
            </h3>
            <p className="card-resumen-extra">
              Margen total observado dentro del histórico disponible.
            </p>
          </div>
        </article>

        <article className="card-resumen-inteligente card-kpi-secundario">
          <span className="card-resumen-etiqueta">
            Posición actual en el rango
          </span>
          <h3 className="card-resumen-valor">{posicionPrecio}</h3>
          <p className="card-resumen-extra">
            Ubicación estimada del precio actual entre el mínimo y el máximo
            histórico.
          </p>
        </article>

        <article className="card-resumen-inteligente card-kpi-secundario">
          <span className="card-resumen-etiqueta">Amplitud del rango</span>
          <h3 className="card-resumen-valor">{amplitudRango}</h3>
          <p className="card-resumen-extra">
            Diferencia total entre el piso y el techo histórico.
          </p>
        </article>

        <article className="card-resumen-inteligente card-kpi-tendencia">
          <span className="card-resumen-etiqueta">Tendencia general</span>
          <div className="card-resumen-tendencia-wrap">
            <span className={`badge-tendencia ${claseTendencia}`}>
              {resumen.tendenciaGeneral || "Sin dato"}
            </span>
          </div>
          <p className="card-resumen-extra">
            Dirección predominante observada en la evolución reciente del precio.
          </p>
        </article>
      </div>
    </section>
  );
}

function obtenerInsightHistoricoResumen(resumen) {
  const cantidadCompras = Number(resumen.cantidadCompras);
  const posicionPrecio = obtenerPosicionPrecio(
    resumen.ultimoPrecioUnitario,
    resumen.precioMinimoHistorico,
    resumen.precioMaximoHistorico
  );
  const tendencia = resumen.tendenciaGeneral || "sin tendencia definida";
  const amplitudRango = obtenerAmplitudRango(
    resumen.precioMinimoHistorico,
    resumen.precioMaximoHistorico
  );

  if (!isNaN(cantidadCompras) && cantidadCompras <= 2) {
    return `El histórico todavía es corto, por lo que conviene interpretar la evaluación con cautela. Aun así, el precio actual se ubica en ${posicionPrecio} del rango observado y la tendencia general es ${tendencia}.`;
  }

  if (!isNaN(cantidadCompras) && cantidadCompras <= 5) {
    return `Ya existe una base inicial para contextualizar la compra. El precio actual se ubica en ${posicionPrecio} del rango histórico, con una amplitud de ${amplitudRango} y una tendencia ${tendencia}.`;
  }

  return `El histórico ofrece una base más sólida para interpretar la compra. El precio actual se ubica en ${posicionPrecio} del rango observado, la amplitud del rango es ${amplitudRango} y la tendencia general registrada es ${tendencia}.`;
}

function obtenerLecturaBase(cantidadCompras) {
  const cantidad = Number(cantidadCompras);

  if (isNaN(cantidad)) {
    return "No hay suficiente información para calificar la base histórica.";
  }

  if (cantidad <= 2) {
    return "Base limitada. Conviene interpretar la evaluación con cautela.";
  }

  if (cantidad <= 5) {
    return "Base inicial. Ya permite una referencia, aunque todavía puede variar bastante.";
  }

  if (cantidad <= 10) {
    return "Base aceptable. El histórico empieza a ser más representativo.";
  }

  return "Base sólida. El análisis cuenta con suficiente historial para respaldar mejor la lectura.";
}

function obtenerAmplitudRango(minimo, maximo) {
  const valorMinimo = Number(minimo);
  const valorMaximo = Number(maximo);

  if (
    isNaN(valorMinimo) ||
    isNaN(valorMaximo) ||
    valorMaximo <= valorMinimo
  ) {
    return "N/A";
  }

  const amplitud = valorMaximo - valorMinimo;

  return formatearMoneda(amplitud);
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

export default ResumenInteligenteCompras;