import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function GraficoHistorialPrecios({ historial }) {
  if (!historial || historial.length === 0) {
    return (
      <div className="estado-vacio-modulo grafico-historial-vacio">
        No hay datos suficientes para mostrar el gráfico de precios.
      </div>
    );
  }

  const datosGrafico = historial.map((item) => ({
    fecha: formatearFecha(item.fechaCompra),
    precioUnitario: Number(item.precioUnitarioCalculado),
    proveedor: item.nombreProveedor
  }));

  return (
    <section className="grafico-historial-seccion">
      <div className="card-base card-grafico-historial">
        <div className="encabezado-grafico">
          <div>
            <h3>Evolución del precio unitario</h3>
            <p>Comportamiento histórico del precio según las compras registradas.</p>
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
                content={<TooltipGraficoPrecio />}
                cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
              />

              <Line
                type="monotone"
                dataKey="precioUnitario"
                stroke="#2563eb"
                strokeWidth={4}
                dot={{ r: 4 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function TooltipGraficoPrecio({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const dato = payload[0]?.payload;

  return (
    <div className="tooltip-grafico-precio">
      <span className="tooltip-grafico-fecha">{label}</span>

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
  if (valor === null || valor === undefined) return "N/A";

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