function CompraInformacionReferencia({
  ultimoPrecio,
  cargandoUltimoPrecio,
  estaEditando,
  compraEditar,
  formatearMonto
}) {
  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "No disponible";
    }

    return new Date(fecha).toLocaleDateString("es-CR");
  };

  const formatearPorcentaje = (valor) => {
    if (valor === null || valor === undefined) {
      return "No disponible";
    }

    return `${Number(valor).toFixed(2)}%`;
  };

  const obtenerClaseTendencia = (tendencia) => {
    const valor = tendencia?.toLowerCase();

    if (valor === "bajó" || valor === "disminucion" || valor === "disminución") {
      return "badge badge--success";
    }

    if (valor === "subió" || valor === "aumento") {
      return "badge badge--neutral";
    }

    return "badge badge--neutral";
  };

  if (!ultimoPrecio && !estaEditando) {
    return null;
  }

  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h3 className="card__title">Información de referencia</h3>
          <p className="card__subtitle">
            Historial útil para comparar esta compra con registros anteriores.
          </p>
        </div>
      </div>

      <div className="card__body">
        {cargandoUltimoPrecio ? (
          <p className="table__cell-muted">Cargando último precio registrado...</p>
        ) : ultimoPrecio ? (
          <div className="form__grid">
            <div className="form__group">
              <span className="label">Último proveedor</span>
              <div className="table__cell-strong">
                {ultimoPrecio.nombreProveedor || "No disponible"}
              </div>
            </div>

            <div className="form__group">
              <span className="label">Última fecha</span>
              <div className="table__cell-strong">
                {formatearFecha(ultimoPrecio.fechaCompra)}
              </div>
            </div>

            <div className="form__group">
              <span className="label">Último precio total</span>
              <div className="table__cell-strong">
                {formatearMonto(ultimoPrecio.precioTotal, ultimoPrecio.moneda)}
              </div>
            </div>

            <div className="form__group">
              <span className="label">Último precio unitario</span>
              <div className="table__cell-strong">
                {formatearMonto(
                  ultimoPrecio.precioUnitarioCalculado,
                  ultimoPrecio.moneda
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="table__cell-muted">
            No hay un precio anterior registrado para esta combinación.
          </p>
        )}

        {estaEditando && (
          <div className="form__grid">
            <div className="form__group">
              <span className="label">Precio unitario calculado</span>
              <div className="table__cell-strong">
                {formatearMonto(
                  compraEditar?.precioUnitarioCalculado,
                  compraEditar?.moneda
                )}
              </div>
            </div>

            <div className="form__group">
              <span className="label">Precio unitario anterior</span>
              <div className="table__cell-strong">
                {formatearMonto(
                  compraEditar?.precioUnitarioAnterior,
                  compraEditar?.moneda
                )}
              </div>
            </div>

            <div className="form__group">
              <span className="label">Diferencia de precio</span>
              <div className="table__cell-strong">
                {formatearMonto(
                  compraEditar?.diferenciaPrecio,
                  compraEditar?.moneda
                )}
              </div>
            </div>

            <div className="form__group">
              <span className="label">Porcentaje de cambio</span>
              <div className="table__cell-strong">
                {formatearPorcentaje(compraEditar?.porcentajeCambioPrecio)}
              </div>
            </div>

            <div className="form__group">
              <span className="label">Tendencia</span>
              <div>
                <span className={obtenerClaseTendencia(compraEditar?.tendenciaPrecio)}>
                  {compraEditar?.tendenciaPrecio || "No disponible"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default CompraInformacionReferencia;