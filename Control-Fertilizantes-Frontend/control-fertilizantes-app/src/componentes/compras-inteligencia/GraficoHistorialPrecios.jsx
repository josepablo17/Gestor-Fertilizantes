import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

function GraficoHistorialPrecios({ historial }) {
  if (!historial || historial.length === 0) {
    return (
      <div className="estado-vacio-modulo grafico-historial-vacio">
        No hay datos suficientes para mostrar el gráfico de precios.
      </div>
    );
  }

  const datosBase = historial.map((item, index, array) => ({
    fecha: formatearFecha(item.fechaCompra),
    precioUnitario: Number(item.precioUnitarioCalculado),
    proveedor: item.nombreProveedor,
    esUltimo: index === array.length - 1
  }));

  const preciosValidos = datosBase
    .map((item) => item.precioUnitario)
    .filter((precio) => !isNaN(precio));

  const promedioHistorico =
    preciosValidos.length > 0
      ? preciosValidos.reduce((acumulado, actual) => acumulado + actual, 0) / preciosValidos.length
      : 0;

  const precioMaximo = preciosValidos.length > 0 ? Math.max(...preciosValidos) : null;
  const precioMinimo = preciosValidos.length > 0 ? Math.min(...preciosValidos) : null;

  const datosGrafico = datosBase.map((item) => ({
    ...item,
    esMaximo: item.precioUnitario === precioMaximo,
    esMinimo: item.precioUnitario === precioMinimo
  }));

  return (
    <section className="grafico-historial-seccion">
      <div className="card-base card-grafico-historial">
        <div className="encabezado-grafico">
          <div className="encabezado-grafico-texto">
            <span className="grafico-kicker">Análisis visual</span>
            <h3>Evolución del precio unitario</h3>
            <p>
              Comportamiento histórico del precio según las compras registradas,
              con referencia del promedio histórico y el punto más reciente evaluado.
            </p>
          </div>

          <div className="grafico-badge-resumen">
            Promedio histórico: {formatearTooltipMoneda(promedioHistorico)}
          </div>
        </div>

        <div className="contenedor-grafico-historial">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={datosGrafico}
              margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid
                stroke="#e2e8f0"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="fecha"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                dy={8}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                width={56}
                tickFormatter={(value) => formatearEjeY(value)}
              />

              <Tooltip
                content={<TooltipGraficoPrecio promedioHistorico={promedioHistorico} />}
                cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
              />

              <ReferenceLine
                y={promedioHistorico}
                stroke="#94a3b8"
                strokeDasharray="6 6"
                ifOverflow="extendDomain"
                label={{
                  value: "Promedio",
                  position: "insideTopRight",
                  fill: "#64748b",
                  fontSize: 12
                }}
              />

              <Line
                type="monotone"
                dataKey="precioUnitario"
                stroke="#2563eb"
                strokeWidth={4}
                dot={<PuntoPersonalizado />}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function PuntoPersonalizado(props) {
  const { cx, cy, payload } = props;

  if (payload?.esUltimo) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={10} fill="rgba(37, 99, 235, 0.18)" />
        <circle cx={cx} cy={cy} r={6} fill="#2563eb" stroke="#ffffff" strokeWidth={3} />
      </g>
    );
  }

  if (payload?.esMaximo) {
    return (
      <circle cx={cx} cy={cy} r={5} fill="#dc2626" stroke="#ffffff" strokeWidth={2} />
    );
  }

  if (payload?.esMinimo) {
    return (
      <circle cx={cx} cy={cy} r={5} fill="#059669" stroke="#ffffff" strokeWidth={2} />
    );
  }

  return (
    <circle cx={cx} cy={cy} r={4} fill="#ffffff" stroke="#2563eb" strokeWidth={3} />
  );
}

function TooltipGraficoPrecio({ active, payload, label, promedioHistorico }) {
  if (!active || !payload || !payload.length) return null;

  const dato = payload[0]?.payload;
  const diferenciaVsPromedio =
    dato?.precioUnitario !== null &&
    dato?.precioUnitario !== undefined &&
    promedioHistorico
      ? dato.precioUnitario - promedioHistorico
      : null;

  return (
    <div className="tooltip-grafico-precio">
      <div className="tooltip-grafico-header">
        <span className="tooltip-grafico-kicker">
          {dato?.esUltimo
            ? "Compra evaluada"
            : dato?.esMaximo
            ? "Pico histórico"
            : dato?.esMinimo
            ? "Mínimo histórico"
            : "Registro histórico"}
        </span>
        <span className="tooltip-grafico-fecha">{label}</span>
      </div>

      <div className="tooltip-grafico-grid">
        <div className="tooltip-grafico-fila">
          <span className="tooltip-grafico-etiqueta">Precio unitario</span>
          <strong className="tooltip-grafico-valor">
            {formatearTooltipMoneda(dato?.precioUnitario)}
          </strong>
        </div>

        <div className="tooltip-grafico-fila">
          <span className="tooltip-grafico-etiqueta">Proveedor</span>
          <strong className="tooltip-grafico-valor tooltip-grafico-proveedor">
            {dato?.proveedor || "N/A"}
          </strong>
        </div>

        <div className="tooltip-grafico-fila">
          <span className="tooltip-grafico-etiqueta">Vs promedio</span>
          <strong className="tooltip-grafico-valor">
            {formatearTooltipMoneda(diferenciaVsPromedio)}
          </strong>
        </div>
      </div>
    </div>
  );
}

function formatearFecha(fecha) {
  if (!fecha) return "N/A";

  return new Date(fecha).toLocaleDateString("es-CR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

function formatearTooltipMoneda(valor) {
  if (valor === null || valor === undefined || isNaN(Number(valor))) return "N/A";

  return Number(valor).toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatearEjeY(valor) {
  if (valor === null || valor === undefined) return "";

  return Number(valor).toLocaleString("es-CR", {
    maximumFractionDigits: 0
  });
}

export default GraficoHistorialPrecios;