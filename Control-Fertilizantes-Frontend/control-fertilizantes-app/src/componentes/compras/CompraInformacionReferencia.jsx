function CompraInformacionReferencia({
  ultimoPrecio,
  cargandoUltimoPrecio,
  estaEditando,
  compraEditar,
  formatearMonto
}) {
  if (!ultimoPrecio && !estaEditando) {
    return null;
  }

  return (
    <div className="campo-formulario-completo seccion-informativa">
      <h3>Información de referencia</h3>

      {cargandoUltimoPrecio ? (
        <p>Cargando último precio registrado...</p>
      ) : ultimoPrecio ? (
        <div className="grid-informacion-compra">
          <div className="item-informacion-compra">
            <span className="etiqueta-informacion">Último proveedor</span>
            <strong>{ultimoPrecio.nombreProveedor || "No disponible"}</strong>
          </div>

          <div className="item-informacion-compra">
            <span className="etiqueta-informacion">Última fecha</span>
            <strong>
              {ultimoPrecio.fechaCompra
                ? new Date(ultimoPrecio.fechaCompra).toLocaleDateString("es-CR")
                : "No disponible"}
            </strong>
          </div>

          <div className="item-informacion-compra">
            <span className="etiqueta-informacion">Último precio total</span>
            <strong>
              {formatearMonto(
                ultimoPrecio.precioTotal,
                ultimoPrecio.moneda
              )}
            </strong>
          </div>

          <div className="item-informacion-compra">
            <span className="etiqueta-informacion">Último precio unitario</span>
            <strong>
              {formatearMonto(
                ultimoPrecio.precioUnitarioCalculado,
                ultimoPrecio.moneda
              )}
            </strong>
          </div>
        </div>
      ) : (
        <p>No hay un precio anterior registrado para esta combinación.</p>
      )}

      {estaEditando && (
        <div className="grid-informacion-compra">
          <div className="item-informacion-compra">
            <span className="etiqueta-informacion">Precio unitario calculado</span>
            <strong>
              {formatearMonto(
                compraEditar?.precioUnitarioCalculado,
                compraEditar?.moneda
              )}
            </strong>
          </div>

          <div className="item-informacion-compra">
            <span className="etiqueta-informacion">Precio unitario anterior</span>
            <strong>
              {formatearMonto(
                compraEditar?.precioUnitarioAnterior,
                compraEditar?.moneda
              )}
            </strong>
          </div>

          <div className="item-informacion-compra">
            <span className="etiqueta-informacion">Diferencia de precio</span>
            <strong>
              {formatearMonto(
                compraEditar?.diferenciaPrecio,
                compraEditar?.moneda
              )}
            </strong>
          </div>

          <div className="item-informacion-compra">
            <span className="etiqueta-informacion">Porcentaje de cambio</span>
            <strong>
              {compraEditar?.porcentajeCambioPrecio !== null &&
              compraEditar?.porcentajeCambioPrecio !== undefined
                ? `${Number(compraEditar.porcentajeCambioPrecio).toFixed(2)}%`
                : "No disponible"}
            </strong>
          </div>

          <div className="item-informacion-compra">
            <span className="etiqueta-informacion">Tendencia</span>
            <strong>{compraEditar?.tendenciaPrecio || "No disponible"}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompraInformacionReferencia;