import { formatearNumero } from "../../utils/numeros.js";
import { formatearMoneda } from "../../utils/moneda.js";

function ResumenComparadorProveedor({ moneda, resumen }) {
  if (!resumen) return null;

  return (
    <div className="stack">
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem"
        }}
      >
        <div className="card">
          <div className="card__body">
            <div className="stack" style={{ gap: "0.35rem" }}>
              <span className="label">Mejor precio actual</span>
              <h3>{resumen.nombreProveedorMejorPrecio || "Sin datos"}</h3>
              <p>{formatearMoneda(resumen.mejorPrecio, moneda)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__body">
            <div className="stack" style={{ gap: "0.35rem" }}>
              <span className="label">Proveedor más estable</span>
              <h3>{resumen.nombreProveedorMasEstable || "Sin datos"}</h3>
              <p className="text-muted">
                Variación:{" "}
                {formatearNumero(resumen.variacionProveedorMasEstable)}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__body">
            <div className="stack" style={{ gap: "0.35rem" }}>
              <span className="label">Recomendado por el sistema</span>
              <h3>{resumen.nombreProveedorRecomendado || "Sin datos"}</h3>
              <p className="text-muted">
                Puntaje:{" "}
                {formatearNumero(resumen.puntajeProveedorRecomendado)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__body">
            <div className="stack" style={{ gap: "0.35rem" }}>
              <span className="label">
                Diferencia entre mejor y peor precio
              </span>
              <h3>
                {formatearMoneda(resumen.diferenciaEntreMejorYPeorPrecio, moneda)}
              </h3>
              <p className="text-muted">
                {resumen.cantidadProveedoresAnalizados || 0} proveedores analizados
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__body">
          <div className="stack" style={{ gap: "0.35rem" }}>
            <h4>Resumen del análisis</h4>
            <p className="text-muted">
              {resumen.mensajeResumen || "No hay mensaje disponible."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumenComparadorProveedor;