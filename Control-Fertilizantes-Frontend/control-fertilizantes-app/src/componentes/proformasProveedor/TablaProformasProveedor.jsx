function formatearMoneda(valor) {
  const numero = Number(valor ?? 0);

  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2
  }).format(numero);
}

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleDateString("es-CR");
}

function TablaProformasProveedor({
  proformas,
  cargando,
  proformasSeleccionadas,
  onSeleccionar,
  onVerDetalle
}) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th></th>
            <th>Número</th>
            <th>Proveedor</th>
            <th>Fecha</th>
            <th>Vencimiento</th>
            <th>Días crédito</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {cargando ? (
            <tr>
              <td colSpan="9">Cargando proformas...</td>
            </tr>
          ) : proformas.length === 0 ? (
            <tr>
              <td colSpan="9">
                No hay proformas registradas con los filtros actuales.
              </td>
            </tr>
          ) : (
            proformas.map((proforma) => {
              const seleccionada = proformasSeleccionadas.includes(
                proforma.idProformaProveedor
              );

              return (
                <tr key={proforma.idProformaProveedor}>
                  <td>
                    <input
                      type="checkbox"
                      checked={seleccionada}
                      onChange={() =>
                        onSeleccionar(proforma.idProformaProveedor)
                      }
                    />
                  </td>

                  <td className="table__cell-strong">
                    {proforma.numeroProforma}
                  </td>

                  <td>
                    <div className="table__cell-strong">
                      {proforma.nombreProveedor || "Sin proveedor"}
                    </div>

                    <small className="text-muted">
                      {proforma.nombreProveedorPdf || "Sin nombre PDF"}
                    </small>
                  </td>

                  <td>{formatearFecha(proforma.fechaProforma)}</td>

                  <td>{formatearFecha(proforma.fechaVencimiento)}</td>

                  <td>{proforma.diasCredito ?? "N/A"}</td>

                  <td className="table__cell-strong">
                    {formatearMoneda(proforma.total)}
                  </td>

                  <td>
                    <span className="badge">
                      {proforma.estado || "Pendiente"}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() =>
                        onVerDetalle(proforma.idProformaProveedor)
                      }
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TablaProformasProveedor;