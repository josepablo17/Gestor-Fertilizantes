import { formatearNumero } from "../../utils/numeros.js";
import AccionesRegistro from "../comunes/AccionesRegistro.jsx";

function TablaPresentacionesProducto({ presentacionesProducto, onDesactivar, ocupado }) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Descripción</th>
            <th>Cantidad</th>
            <th>Unidad de medida</th>
            <th>Cantidad normalizada</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {presentacionesProducto.map((presentacion) => (
            <tr key={presentacion.idPresentacionProducto}>
              <td>
                <span className="table__cell-strong">
                  {presentacion.nombreProducto || "Sin producto"}
                </span>
              </td>

              <td>
                <span
                  className="table__cell-muted table__cell-truncate"
                  title={presentacion.descripcion || "Sin descripción"}
                >
                  {presentacion.descripcion || "Sin descripción"}
                </span>
              </td>

              <td>
                <span className="table__cell-muted">
                  {formatearNumero(presentacion.cantidad)}
                </span>
              </td>

              <td>
                <span className="table__cell-muted">
                  {presentacion.nombreUnidadMedida || "Sin unidad"}
                </span>
              </td>

              <td>
                <span className="table__cell-muted">
                  {formatearNumero(presentacion.cantidadNormalizada)}
                </span>
              </td>

              <td>
                <span
                  className={
                    presentacion.activo
                      ? "badge badge--success"
                      : "badge badge--neutral"
                  }
                >
                  {presentacion.activo ? "Activo" : "Inactivo"}
                </span>
              </td>

              <td>
                <AccionesRegistro rutaEdicion={`/presentacionProductos/editar/${presentacion.idPresentacionProducto}`}
                  onCambiarEstado={presentacion.activo ? () => onDesactivar(presentacion) : undefined}
                  ocupado={ocupado} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaPresentacionesProducto;