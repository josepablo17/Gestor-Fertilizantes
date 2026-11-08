import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Campo from "../../../componentes/comunes/Campo.jsx";
import Pagina, { EstadoConsulta, Mensajes, Tarjeta } from "../../../componentes/comunes/Pagina.jsx";
import useConsulta from "../../../hooks/useConsulta.js";
import useOperacion from "../../../hooks/useOperacion.js";
import { fechaHora } from "../../../utils/datosApi.js";
import { establecerMontoPartida, aprobarPresupuesto, cerrarPresupuesto, consultarPresupuesto, finalizarCompromiso, obtenerCatalogos } from "../api/presupuestosApi.js";
import useIdOperacion from "../hooks/useIdOperacion.js";
import { desdeDiezMilesimas, fechaCorta, importeEnDiezMilesimas, monedaVisible, motivoValido } from "../utils/presupuesto.js";
import FormularioPresupuesto from "../componentes/FormularioPresupuesto.jsx";
import FormularioMontoPartida from "../componentes/FormularioMontoPartida.jsx";

const columnas = [["Monto inicial", "montoInicial"], ["Aprobado", "aprobado"], ["Comprometido", "comprometido"],
  ["Ejecutado", "ejecutado"], ["Disponible", "disponible"]];
const tiposMovimiento = {
  Aprobacion: "Aprobación", Ajuste: "Ajuste", Reserva: "Reserva", Liberacion: "Liberación",
  Compra: "Compra", ReversionCompra: "Reversión",
};

export default function PresupuestoDetalle() {
  const { id } = useParams();
  const cargar = useCallback((signal) => consultarPresupuesto(id, signal), [id]);
  const consulta = useConsulta(cargar);
  const operacion = useOperacion();
  const { conOperacion, completarOperacion } = useIdOperacion();
  const [accion, setAccion] = useState(null);
  const [editarBorrador, setEditarBorrador] = useState(false);

  function aplicar(datos) {
    operacion.ejecutar(async () => {
      const { ejecutar, id: objetivo, etiqueta } = accion;
      await ejecutar(objetivo, conOperacion(datos, `${etiqueta}-${objetivo}`));
      completarOperacion();
      setAccion(null);
      consulta.recargar();
    }, "Operación registrada.");
  }

  const presupuesto = consulta.datos?.presupuesto;
  return <Pagina titulo={presupuesto?.nombre ?? "Detalle de presupuesto"}
    descripcion={presupuesto && `${presupuesto.finca ?? "General"} · ${fechaCorta(presupuesto.fechaInicio)} a ${fechaCorta(presupuesto.fechaFin)} · ${presupuesto.moneda} · ${presupuesto.estado}`}
    acciones={<Link to="/presupuestos" className="btn btn--secondary">Volver a presupuestos</Link>}>
    <Mensajes {...operacion} />
    <EstadoConsulta estado={consulta}>
      {presupuesto && editarBorrador && <EditorBorrador key={presupuesto.version} datos={consulta.datos}
        cancelar={() => setEditarBorrador(false)} guardar={(datos) => { consulta.actualizar(datos); setEditarBorrador(false); }} />}
      {presupuesto && accion && (accion.ejecutar === establecerMontoPartida
        ? <FormularioMontoPartida key={accion.id} accion={accion} aplicar={aplicar} ocupado={operacion.ocupado} cancelar={() => setAccion(null)} />
        : <FormularioMovimiento key={`${accion.etiqueta}-${accion.id}`} accion={accion} aplicar={aplicar} ocupado={operacion.ocupado} cancelar={() => setAccion(null)} />)}
      {presupuesto && <ContenidoDetalle datos={consulta.datos} elegir={setAccion} editar={() => setEditarBorrador(true)}
        ocupado={operacion.ocupado || editarBorrador || Boolean(accion)} />}
    </EstadoConsulta>
  </Pagina>;
}

function EditorBorrador({ datos, cancelar, guardar }) {
  const catalogos = useConsulta(obtenerCatalogos);
  return <EstadoConsulta estado={catalogos}>{catalogos.datos && <FormularioPresupuesto
    catalogos={catalogos.datos} borrador={datos} alGuardar={guardar} cancelar={cancelar} />}</EstadoConsulta>;
}

function ContenidoDetalle({ datos, elegir, editar, ocupado }) {
  const { presupuesto: p, partidas, movimientos, compromisos } = datos;
  const rubros = new Map(partidas.map((fila) => [String(fila.idPartidaPresupuesto), fila.rubro]));
  const primeraPorCompromiso = new Set();
  const moneda = (m) => monedaVisible(m, p.moneda);
  const total = (campo) => moneda(desdeDiezMilesimas(partidas.reduce((suma, fila) => suma + importeEnDiezMilesimas(fila[campo]), 0n)));
  const columnasVisibles = p.estado === "Borrador" ? [["Monto planificado", "montoInicial"]] : columnas;

  return <>
    <Tarjeta titulo={p.estado === "Borrador" ? "Partidas del borrador" : "Saldos por partida"}>
      {p.estado === "Borrador" && <p>Puedes corregir los datos y montos antes de aprobar. El saldo estará disponible al aprobar el presupuesto.</p>}
      <div className="table-wrapper"><table className="table">
        <thead><tr><th>Rubro</th>{columnasVisibles.map(([titulo]) => <th key={titulo}>{titulo}</th>)}{p.estado === "Aprobado" && <th>Acción</th>}</tr></thead>
        <tbody>{partidas.map((fila) => <tr key={fila.idPartidaPresupuesto}>
          <td>{fila.rubro}</td>{columnasVisibles.map(([titulo, campo]) => <td key={titulo}>{moneda(fila[campo])}</td>)}
          {p.estado === "Aprobado" && <td><button type="button" className="btn btn--secondary" disabled={ocupado}
            onClick={() => elegir({ etiqueta: "Cambiar monto", id: fila.idPartidaPresupuesto, ejecutar: establecerMontoPartida, partida: fila, moneda: p.moneda })}>Cambiar monto</button></td>}
        </tr>)}</tbody>
        <tfoot><tr><th>Total</th>{columnasVisibles.map(([titulo, campo]) => <td key={titulo}>{total(campo)}</td>)}
          {p.estado === "Aprobado" && <td />}</tr></tfoot>
      </table></div>
      {p.motivoCierre && <p>Motivo de cierre {p.motivoCierre}</p>}
      {p.estado !== "Cerrado" && <div className="form-actions">
        {p.estado === "Borrador" ? <>
          <button type="button" className="btn btn--secondary" disabled={ocupado} onClick={editar}>Editar borrador</button>
          <button type="button" className="btn btn--primary" disabled={ocupado}
            onClick={() => elegir({ etiqueta: "Aprobar presupuesto", id: p.idPresupuesto, ejecutar: aprobarPresupuesto })}>Aprobar presupuesto</button></>
          : <button type="button" className="btn btn--secondary" disabled={ocupado || partidas.some((fila) => Number(fila.comprometido) > 0)}
            onClick={() => elegir({ etiqueta: "Cerrar presupuesto", id: p.idPresupuesto, ejecutar: cerrarPresupuesto })}>Cerrar presupuesto</button>}
      </div>}
      {p.estado === "Aprobado" && partidas.some((fila) => Number(fila.comprometido) > 0) &&
        <p className="text-muted">Finaliza los compromisos con saldo pendiente antes de cerrar el presupuesto.</p>}
    </Tarjeta>
    <Tarjeta titulo="Compromisos">
      {compromisos.length === 0 ? <p>No hay compromisos en este presupuesto.</p> :
        <div className="table-wrapper"><table className="table">
          <thead><tr><th>Compromiso</th><th>Fecha</th><th>Rubro</th><th>Estado</th><th>Reserva</th><th>Pendiente</th>
            <th>Ejecutado</th><th>Acciones</th></tr></thead>
          <tbody>{compromisos.map((c) => {
            const id = c.idCompromisoCompra;
            const primera = !primeraPorCompromiso.has(id);
            primeraPorCompromiso.add(id);
            return <tr key={c.idCompromisoDetalle}>
              <td>#{id}</td><td>{fechaCorta(c.fechaCompromiso)}</td><td>{rubros.get(String(c.idPartidaPresupuesto))}</td>
              <td>{c.estado}{c.motivoCierre && <small> · {c.motivoCierre}</small>}</td>
              <td>{moneda(c.montoReservado)}</td><td>{moneda(c.pendiente)}</td><td>{moneda(c.ejecutado)}</td>
              <td>{primera && c.estado === "Abierto" && <button type="button" className="btn btn--secondary" disabled={ocupado}
                onClick={() => elegir({ etiqueta: "Finalizar compromiso", id, ejecutar: finalizarCompromiso })}>Finalizar #{id}</button>}</td>
            </tr>;
          })}</tbody>
        </table></div>}
    </Tarjeta>
    <Tarjeta titulo="Historial de movimientos">
      {movimientos.length === 0 ? <p>Los movimientos aparecerán cuando se apruebe el presupuesto.</p> :
        <div className="table-wrapper"><table className="table">
          <thead><tr><th>Fecha</th><th>Movimiento</th><th>Rubro</th><th>Aprobado</th><th>Comprometido</th><th>Ejecutado</th><th>Motivo</th></tr></thead>
          <tbody>{movimientos.map((m) => <tr key={m.idMovimientoPresupuesto}>
            <td>{fechaHora(m.fechaRegistro)}</td><td>{tiposMovimiento[m.tipo] ?? m.tipo}
              {m.idCompra && <> · <Link to={`/compras/editar/${m.idCompra}`}>Compra #{m.idCompra}</Link></>}</td>
            <td>{rubros.get(String(m.idPartidaPresupuesto))}</td>
            <td>{moneda(m.cambioAprobado)}</td><td>{moneda(m.cambioComprometido)}</td><td>{moneda(m.cambioEjecutado)}</td>
            <td>{m.motivo}{m.motivoExceso && <small> · Exceso: {m.motivoExceso}</small>}</td>
          </tr>)}</tbody>
        </table></div>}
    </Tarjeta>
  </>;
}

function FormularioMovimiento({ accion, aplicar, cancelar, ocupado }) {
  const [motivo, setMotivo] = useState("");
  const [estado, setEstado] = useState("Cerrado");
  const [error, setError] = useState("");
  const finalizacion = accion.ejecutar === finalizarCompromiso;
  return <Tarjeta titulo={accion.etiqueta}>
    <form className="form" onSubmit={(e) => {
      e.preventDefault();
      setError("");
      try {
        const datos = { motivo: motivoValido(motivo) };
        if (finalizacion) datos.estado = estado;
        aplicar(datos);
      } catch (fallo) { setError(fallo.message); }
    }}>
      {finalizacion && <p>Se liberará el saldo pendiente de este compromiso en todas sus partidas. Si ya tiene compras, debes cerrarlo.</p>}
      <div className="form-row form-row--3">
        {finalizacion && <Campo etiqueta="Estado final" valor={estado} cambiar={setEstado} required
          opciones={[{ value: "Cerrado", label: "Cerrar" }, { value: "Cancelado", label: "Cancelar compromiso" }]} />}
        <Campo etiqueta="Motivo de la operación" valor={motivo} cambiar={setMotivo} textoLargo maxLength={500} required />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn--secondary" disabled={ocupado} onClick={cancelar}>Volver</button>
        <button className="btn btn--primary" disabled={ocupado}>Confirmar</button>
      </div>
      <Mensajes error={error} />
    </form>
  </Tarjeta>;
}
