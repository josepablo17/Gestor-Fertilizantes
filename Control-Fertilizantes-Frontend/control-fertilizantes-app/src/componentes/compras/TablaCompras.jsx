import { formatearNumero, formatearCantidadComprada } from "../../utils/numeros.js";
import AccionesRegistro from "../comunes/AccionesRegistro.jsx";

function TablaCompras({ compras }) {
  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "Sin fecha";
    }

    return new Date(fecha).toLocaleDateString("es-CR");
  };

  const formatearMonto = (monto, moneda) => {
    if (monto === null || monto === undefined || monto === "") {
      return "No disponible";
    }

    return `${moneda || ""} ${formatearNumero(monto)}`.trim();
  };

  const obtenerClaseTendencia = (tendencia) => {
    const valor = tendencia?.toLowerCase();

    if (valor === "subió") {
      return "badge badge--neutral";
    }

    if (valor === "bajó") {
      return "badge badge--success";
    }

    return "badge badge--neutral";
  };

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Proveedor</th>
            <th>Presentación</th>
            <th>Fecha</th>
            <th>Cantidad</th>
            <th>Precio total</th>
            <th>Precio unitario</th>
            <th>Tendencia</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {compras.map((compra) => (
            <tr key={compra.idCompra}>
              <td>
                <div>
                  <span className="table__cell-strong">
                    {compra.nombreProducto || "Sin producto"}
                  </span>
                  <br />
                  <span className="table__cell-muted">
                    {compra.categoria || "Sin categoría"} • {compra.marca || "Sin marca"}
                  </span>
                </div>
              </td>

              <td>
                <span className="table__cell-muted">
                  {compra.nombreProveedor || "Sin proveedor"}
                </span>
              </td>

              <td>
                <div>
                  <span className="table__cell-strong">
                    {compra.presentacion || "Sin presentación"}
                  </span>
                  <br />
                  <span className="table__cell-muted">
                    {formatearNumero(compra.cantidadPresentacion)} {compra.unidadMedida || ""}
                  </span>
                </div>
              </td>

              <td>
                <span className="table__cell-muted">
                  {formatearFecha(compra.fechaCompra)}
                </span>
              </td>

              <td>
                <span className="table__cell-muted">
                  {formatearCantidadComprada(compra.cantidadComprada)}
                </span>
              </td>

              <td>
                <span className="table__cell-muted">
                  {formatearMonto(compra.precioTotal, compra.moneda)}
                </span>
              </td>

              <td>
                <span className="table__cell-muted">
                  {formatearMonto(compra.precioUnitarioCalculado, compra.moneda)}
                </span>
              </td>

              <td>
                <span className={obtenerClaseTendencia(compra.tendenciaPrecio)}>
                  {compra.tendenciaPrecio || "Sin tendencia"}
                </span>
              </td>

              <td>
                <AccionesRegistro rutaEdicion={`/compras/editar/${compra.idCompra}`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaCompras;