import {
  formatearFecha,
  formatearMoneda
} from "./compararProformasUtils";

function ResumenProformasComparadas({ proformas }) {
  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h2 className="card__title">Resumen por proveedor</h2>
          <p className="card__subtitle">
            Totales generales y condiciones comerciales de cada proforma.
          </p>
        </div>
      </div>

      <div className="card__body">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Proforma</th>
                <th>Subtotal</th>
                <th>Descuento</th>
                <th>IVA</th>
                <th>Total</th>
                <th>Vencimiento</th>
                <th>Días crédito</th>
              </tr>
            </thead>

            <tbody>
              {proformas.map((proforma) => (
                <tr key={proforma.idProformaProveedor}>
                  <td className="table__cell-strong">
                    {proforma.nombreProveedor}
                  </td>
                  <td>{proforma.numeroProforma}</td>
                  <td>{formatearMoneda(proforma.subtotal, proforma.moneda)}</td>
                  <td>
                    {formatearMoneda(proforma.descuento, proforma.moneda)}
                  </td>
                  <td>{formatearMoneda(proforma.iva, proforma.moneda)}</td>
                  <td className="table__cell-strong">
                    {formatearMoneda(proforma.total, proforma.moneda)}
                  </td>
                  <td>{formatearFecha(proforma.fechaVencimiento)}</td>
                  <td>{proforma.diasCredito ?? "No indicado"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default ResumenProformasComparadas;
