import {
  formatearMoneda,
  obtenerMejorProveedor
} from "./compararProformasUtils";

function TablaComparativaProformas({
  proformas,
  filasComparativas,
  criterioComparacion,
  setCriterioComparacion,
  monedaPrincipal
}) {
  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h2 className="card__title">Comparación de líneas</h2>
          <p className="card__subtitle">
            Los productos se agrupan por producto y presentación. Si un
            proveedor no cotizó un producto, se muestra como no cotizado.
          </p>
        </div>

        <div className="toolbar__group">
          <select
            className="select"
            value={criterioComparacion}
            onChange={(e) => setCriterioComparacion(e.target.value)}
          >
            <option value="precioUnitario">Mejor por precio unitario</option>
            <option value="totalLinea">Mejor por total de línea</option>
          </select>
        </div>
      </div>

      <div className="card__body">
        <div className="table-wrapper">
          <table className="table quote-comparison-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Presentación</th>

                {proformas.map((proforma) => (
                  <th key={proforma.idProformaProveedor}>
                    {proforma.nombreProveedor}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filasComparativas.map((fila) => {
                const mejorProveedor = obtenerMejorProveedor(
                  fila,
                  criterioComparacion
                );

                return (
                  <tr key={fila.clave}>
                    <td className="table__cell-strong">
                      {fila.nombreProducto}
                    </td>
                    <td>{fila.nombrePresentacion}</td>

                    {proformas.map((proforma) => {
                      const linea =
                        fila.cotizaciones[proforma.idProformaProveedor];

                      const esMejor =
                        mejorProveedor?.idProformaProveedor ===
                        proforma.idProformaProveedor;

                      return (
                        <td key={proforma.idProformaProveedor}>
                          {!linea ? (
                            <span className="badge quote-comparison-badge--missing">
                              No cotizado
                            </span>
                          ) : (
                            <div
                              className={`quote-comparison-cell ${
                                esMejor ? "quote-comparison-cell--best" : ""
                              }`}
                            >
                              <div className="quote-comparison-cell__top">
                                <strong>
                                  {formatearMoneda(
                                    linea.precioUnitario,
                                    monedaPrincipal
                                  )}
                                </strong>

                                {esMejor && (
                                  <span className="badge quote-comparison-badge--best">
                                    Mejor opción
                                  </span>
                                )}
                              </div>

                              <div className="quote-comparison-cell__details">
                                <span>
                                  Cantidad: {linea.cantidad}{" "}
                                  {linea.unidadMedida}
                                </span>
                                <span>
                                  Total:{" "}
                                  {formatearMoneda(
                                    linea.totalLinea,
                                    monedaPrincipal
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filasComparativas.length === 0 && (
          <p className="text-muted">
            Las proformas seleccionadas no tienen líneas para comparar.
          </p>
        )}
      </div>
    </section>
  );
}

export default TablaComparativaProformas;
