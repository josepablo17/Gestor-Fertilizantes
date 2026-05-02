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
      <div className="estado-vacio-modulo">
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
      ? preciosValidos.reduce((a, b) => a + b, 0) / preciosValidos.length
      : 0;

  const precioMaximo = Math.max(...preciosValidos);
  const precioMinimo = Math.min(...preciosValidos);

  const datosGrafico = datosBase.map((item) => ({
    ...item,
    esMaximo: item.precioUnitario === precioMaximo,
    esMinimo: item.precioUnitario === precioMinimo
  }));

  return (
    <section className="card">
      <div className="card__header flex flex--between">
        <div>
          <h3 className="card__title">Evolución del precio unitario</h3>
          <p className="card__subtitle">
            Comportamiento histórico del precio con referencia al promedio.
          </p>
        </div>

        <span className="badge badge--neutral">
          Promedio: {formatearTooltipMoneda(promedioHistorico)}
        </span>
      </div>

      <div className="card__body">
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={datosGrafico}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="fecha"
                tickLine={false}
                axisLine={false}
                className="chart-axis"
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                width={60}
                tickFormatter={(value) => formatearEjeY(value)}
                className="chart-axis"
              />

              <Tooltip content={<TooltipGraficoPrecio promedioHistorico={promedioHistorico} />} />

              <ReferenceLine
                y={promedioHistorico}
                strokeDasharray="6 6"
                label="Promedio"
              />

              <Line
                type="monotone"
                dataKey="precioUnitario"
                strokeWidth={3}
                dot={<PuntoPersonalizado />}
                activeDot={{ r: 6 }}
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
  if (!active || !payload?.length) return null;

  const dato = payload[0]?.payload;

  const diferencia =
    dato?.precioUnitario && promedioHistorico
      ? dato.precioUnitario - promedioHistorico
      : null;

  return (
    <div className="card card--tooltip">
      <div className="card__body stack--sm">

        <div className="flex flex--between text-sm text-muted">
          <span>
            {dato?.esUltimo
              ? "Compra evaluada"
              : dato?.esMaximo
              ? "Pico"
              : dato?.esMinimo
              ? "Mínimo"
              : "Histórico"}
          </span>

          <span>{label}</span>
        </div>

        <div className="stack--xs">
          <div className="flex flex--between">
            <span className="text-muted">Precio</span>
            <strong>{formatearTooltipMoneda(dato?.precioUnitario)}</strong>
          </div>

          <div className="flex flex--between">
            <span className="text-muted">Proveedor</span>
            <strong>{dato?.proveedor || "N/A"}</strong>
          </div>

          <div className="flex flex--between">
            <span className="text-muted">Vs promedio</span>
            <strong>{formatearTooltipMoneda(diferencia)}</strong>
          </div>
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