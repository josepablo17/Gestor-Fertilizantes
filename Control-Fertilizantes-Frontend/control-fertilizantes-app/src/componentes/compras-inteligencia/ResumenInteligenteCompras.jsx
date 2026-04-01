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
  const claseVariacionUltimo = obtenerClaseVariacion(resumen.porcentajeVariacionVsUltimoPrecio);

  return (
    <section className="resumen-inteligente-seccion">
      <div className="encabezado-resumen-inteligente">
        <div>
          <h3>Resumen ejecutivo del comportamiento de precios</h3>
          <p>
            Vista rápida de indicadores clave para entender la posición actual del
            precio frente al historial registrado.
          </p>
        </div>
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
              Base histórica del precio unitario para este producto y presentación.
            </p>
          </div>
        </article>

        <article className="card-base card-resumen-inteligente card-kpi-hero">
          <div className="card-resumen-superior">
            <span className="card-resumen-etiqueta">Último precio</span>
            <span className="card-resumen-chip">Actual</span>
          </div>

          <div className="card-resumen-cuerpo">
            <h3 className="card-resumen-valor">
              {formatearMoneda(resumen.ultimoPrecioUnitario)}
            </h3>
            <p className="card-resumen-extra">
              Valor unitario de la compra más reciente registrada.
            </p>
          </div>
        </article>

        <article className="card-base card-resumen-inteligente card-kpi-variacion">
          <span className="card-resumen-etiqueta">Variación vs promedio</span>
          <h3 className={`card-resumen-valor ${claseVariacionPromedio}`}>
            {formatearPorcentaje(resumen.porcentajeVariacionVsPromedio)}
          </h3>
          <p className="card-resumen-extra">
            Diferencia del precio actual frente a la referencia histórica.
          </p>
        </article>

        <article className="card-base card-resumen-inteligente card-kpi-tendencia">
          <span className="card-resumen-etiqueta">Tendencia general</span>
          <div className="card-resumen-tendencia-wrap">
            <span className={`badge-tendencia ${claseTendencia}`}>
              {resumen.tendenciaGeneral || "Sin dato"}
            </span>
          </div>
          <p className="card-resumen-extra">
            Comportamiento dominante observado en la evolución reciente del precio.
          </p>
        </article>

        <article className="card-base card-resumen-inteligente card-kpi-secundario">
          <span className="card-resumen-etiqueta">Cantidad de compras</span>
          <h3 className="card-resumen-valor">{resumen.cantidadCompras}</h3>
          <p className="card-resumen-extra">
            Registros utilizados para construir el análisis.
          </p>
        </article>

        <article className="card-base card-resumen-inteligente card-kpi-secundario">
          <span className="card-resumen-etiqueta">Precio mínimo</span>
          <h3 className="card-resumen-valor">
            {formatearMoneda(resumen.precioMinimoHistorico)}
          </h3>
          <p className="card-resumen-extra">
            Piso histórico registrado en las compras del producto.
          </p>
        </article>

        <article className="card-base card-resumen-inteligente card-kpi-secundario">
          <span className="card-resumen-etiqueta">Precio máximo</span>
          <h3 className="card-resumen-valor">
            {formatearMoneda(resumen.precioMaximoHistorico)}
          </h3>
          <p className="card-resumen-extra">
            Pico histórico registrado dentro del historial disponible.
          </p>
        </article>

        <article className="card-base card-resumen-inteligente card-kpi-secundario">
          <span className="card-resumen-etiqueta">Variación vs último precio</span>
          <h3 className={`card-resumen-valor ${claseVariacionUltimo}`}>
            {formatearPorcentaje(resumen.porcentajeVariacionVsUltimoPrecio)}
          </h3>
          <p className="card-resumen-extra">
            Cambio observado respecto a la compra inmediatamente anterior.
          </p>
        </article>
      </div>
    </section>
  );
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

function obtenerClaseTendencia(tendencia) {
  if (!tendencia) return "tendencia-neutral";

  const valor = tendencia.toLowerCase();

  if (valor.includes("al alza")) return "tendencia-alza";
  if (valor.includes("a la baja")) return "tendencia-baja";
  if (valor.includes("estable")) return "tendencia-estable";

  return "tendencia-neutral";
}

function obtenerClaseVariacion(valor) {
  if (valor === null || valor === undefined) return "variacion-neutral";
  if (Number(valor) > 0) return "variacion-alza";
  if (Number(valor) < 0) return "variacion-baja";
  return "variacion-neutral";
}

export default ResumenInteligenteCompras;