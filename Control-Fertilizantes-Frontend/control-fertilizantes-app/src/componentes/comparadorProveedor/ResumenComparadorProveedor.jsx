function formatearMoneda(valor) {
  const numero = Number(valor ?? 0);

  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2
  }).format(numero);
}

function ResumenComparadorProveedor({ resumen }) {
  if (!resumen) return null;

  return (
    <div className="seccion-resumen-comparador">
      <div className="grid-resumen-comparador">
        <div className="card-resumen-comparador">
          <span className="card-resumen-comparador__etiqueta">
            Mejor precio actual
          </span>
          <h3>{resumen.nombreProveedorMejorPrecio || "Sin datos"}</h3>
          <p className="card-resumen-comparador__valor">
            {formatearMoneda(resumen.mejorPrecio)}
          </p>
        </div>

        <div className="card-resumen-comparador">
          <span className="card-resumen-comparador__etiqueta">
            Proveedor más estable
          </span>
          <h3>{resumen.nombreProveedorMasEstable || "Sin datos"}</h3>
          <p className="card-resumen-comparador__valor-secundario">
            Variación: {Number(resumen.variacionProveedorMasEstable ?? 0).toFixed(2)}%
          </p>
        </div>

        <div className="card-resumen-comparador card-resumen-comparador--destacada">
          <span className="card-resumen-comparador__etiqueta">
            Recomendado por el sistema
          </span>
          <h3>{resumen.nombreProveedorRecomendado || "Sin datos"}</h3>
          <p className="card-resumen-comparador__valor-secundario">
            Puntaje: {Number(resumen.puntajeProveedorRecomendado ?? 0).toFixed(2)}
          </p>
        </div>

        <div className="card-resumen-comparador">
          <span className="card-resumen-comparador__etiqueta">
            Diferencia entre mejor y peor precio
          </span>
          <h3>{formatearMoneda(resumen.diferenciaEntreMejorYPeorPrecio)}</h3>
          <p className="card-resumen-comparador__valor-secundario">
            {resumen.cantidadProveedoresAnalizados || 0} proveedores analizados
          </p>
        </div>
      </div>

      <div className="card-mensaje-resumen-comparador">
        <h4>Resumen del análisis</h4>
        <p>{resumen.mensajeResumen || "No hay mensaje disponible."}</p>
      </div>
    </div>
  );
}

export default ResumenComparadorProveedor;