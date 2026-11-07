import { useCallback } from "react";
import Campo from "../../../componentes/comunes/Campo.jsx";
import { EstadoConsulta } from "../../../componentes/comunes/Pagina.jsx";
import useConsulta from "../../../hooks/useConsulta.js";
import { obtenerOpciones } from "../api/presupuestosApi.js";
import { filaDistribucion, fechaCorta, monedaVisible } from "../utils/presupuesto.js";

export default function DistribucionPresupuesto({ filas, cambiar, fecha, moneda, idProducto, idPresentacionProducto, idProveedor, ofertas, ocupado }) {
  const cargar = useCallback((signal) => fecha && moneda
    ? obtenerOpciones({ fecha, moneda, idProducto, idPresentacionProducto, idProveedor }, signal)
    : Promise.resolve(null), [fecha, moneda, idProducto, idPresentacionProducto, idProveedor]);
  const estado = useConsulta(cargar);

  function asignar(clave, campo, valor) {
    cambiar(filas.map((fila) => fila.clave === clave ? {
      ...fila,
      [campo]: valor,
      ...(campo === "idPartidaPresupuesto" ? { idCompromisoDetalle: "" } : {}),
    } : fila));
  }

  if (!fecha || !moneda) return <p className="text-muted">Indica la fecha y la moneda para consultar partidas.</p>;

  return <EstadoConsulta estado={estado}>
    {estado.datos && (estado.datos.partidas.length ? <fieldset disabled={ocupado} className="form presupuesto-distribucion">
      <legend>Distribución entre partidas</legend>
      {filas.map((fila, indice) => {
        const compromisos = estado.datos.compromisos.filter((c) => String(c.idPartidaPresupuesto) === fila.idPartidaPresupuesto);
        return <div className="form-row form-row--3" key={fila.clave}>
          <Campo etiqueta={`Partida ${indice + 1}`} valor={fila.idPartidaPresupuesto}
            cambiar={(valor) => asignar(fila.clave, "idPartidaPresupuesto", valor)} required
            opciones={estado.datos.partidas.map((p) => ({
              value: p.idPartidaPresupuesto,
              label: `${p.presupuesto} · ${p.finca ?? "General"} · ${p.rubro} · saldo ${monedaVisible(p.disponible, moneda)}`,
            }))} />
          {ofertas && <Campo etiqueta={`Oferta ${indice + 1}`} valor={fila.idProformaProveedorDetalle} required
            cambiar={(valor) => asignar(fila.clave, "idProformaProveedorDetalle", valor)} opciones={ofertas} />}
          {!ofertas && compromisos.length > 0 && <Campo etiqueta={`Compromiso ${indice + 1} (opcional)`} valor={fila.idCompromisoDetalle}
            cambiar={(valor) => asignar(fila.clave, "idCompromisoDetalle", valor)}
            opciones={compromisos.map((c) => ({
              value: c.idCompromisoDetalle,
              label: `#${c.idCompromisoCompra} · ${fechaCorta(c.fechaCompromiso)} · ${c.proveedor ?? "Reserva manual"} · pendiente ${monedaVisible(c.pendiente, moneda)}`,
            }))} />}
          <Campo etiqueta={`Importe ${indice + 1}`} valor={fila.monto} required formatoNumerico="decimal"
            cambiar={(valor) => asignar(fila.clave, "monto", valor)} />
          {filas.length > 1 && <div className="form-actions">
            <button type="button" className="btn btn--secondary"
              onClick={() => cambiar(filas.filter((otra) => otra.clave !== fila.clave))}>Quitar distribución {indice + 1}</button>
          </div>}
        </div>;
      })}
      <div className="form-actions">
        <button type="button" className="btn btn--secondary" disabled={filas.length >= 100}
          onClick={() => cambiar([...filas, filaDistribucion()])}>Agregar distribución</button>
      </div>
    </fieldset> : <p className="text-muted">No hay partidas aprobadas para esta fecha y moneda.</p>)}
  </EstadoConsulta>;
}
