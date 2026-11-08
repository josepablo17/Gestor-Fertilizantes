import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Campo from "../../../componentes/comunes/Campo.jsx";
import { Mensajes, Tarjeta } from "../../../componentes/comunes/Pagina.jsx";
import useOperacion from "../../../hooks/useOperacion.js";
import { fechaLocal } from "../../../utils/datosApi.js";
import { numeroEditable } from "../../../utils/numeros.js";
import { crearPresupuesto, editarBorradorPresupuesto } from "../api/presupuestosApi.js";
import useIdOperacion from "../hooks/useIdOperacion.js";
import { monedas, motivoValido } from "../utils/presupuesto.js";
import { prepararBorradorPresupuesto } from "../utils/edicionPresupuesto.js";

const partidaNueva = () => ({ clave: crypto.randomUUID(), idRubroPresupuesto: "", monto: "" });

export default function FormularioPresupuesto({ catalogos, borrador, alGuardar, cancelar }) {
  const p = borrador?.presupuesto;
  const [datos, setDatos] = useState(() => ({ nombre: p?.nombre ?? "", fechaInicio: p?.fechaInicio.slice(0, 10) ?? fechaLocal(),
    fechaFin: p?.fechaFin.slice(0, 10) ?? "", moneda: p?.moneda ?? "CRC", idFinca: p?.idFinca ?? "", motivo: "" }));
  const [partidas, setPartidas] = useState(() => borrador ? borrador.partidas.map((fila) => ({
    clave: crypto.randomUUID(), idRubroPresupuesto: String(fila.idRubroPresupuesto), monto: numeroEditable(fila.montoInicial),
  })) : [partidaNueva()]);
  const operacion = useOperacion();
  const { conOperacion } = useIdOperacion();
  const navegar = useNavigate();
  const asignar = (campo) => (valor) => setDatos((actual) => ({ ...actual, [campo]: valor }));
  const asignarPartida = (clave, campo) => (valor) => setPartidas((actual) => actual.map((fila) => fila.clave === clave ? { ...fila, [campo]: valor } : fila));
  const rubros = catalogos.rubros.filter((r) => r.activo || partidas.some((fila) => String(fila.idRubroPresupuesto) === String(r.idRubroPresupuesto)))
    .map((r) => ({ value: r.idRubroPresupuesto, label: r.nombre + (r.activo ? "" : " (inactivo)"), disabled: !r.activo }));
  const fincas = catalogos.fincas.filter((f) => f.activa || String(f.idFinca) === String(datos.idFinca))
    .map((f) => ({ value: f.idFinca, label: f.nombre + (f.activa ? "" : " (inactiva)"), disabled: !f.activa }));

  return <Tarjeta titulo={p ? "Editar borrador" : "Nuevo presupuesto"}>
    {p && <p>Corrige los datos y montos planificados antes de aprobar el presupuesto.</p>}
    {rubros.length === 0 && <p>Registra un rubro antes de crear el presupuesto.</p>}
    <form className="form" onSubmit={(e) => {
      e.preventDefault();
      operacion.ejecutar(async () => {
        const cuerpo = prepararBorradorPresupuesto(datos, partidas);
        if (p) alGuardar(await editarBorradorPresupuesto(p.idPresupuesto, conOperacion({ ...cuerpo, version: p.version }, p.idPresupuesto)));
        else navegar(`/presupuestos/${await crearPresupuesto(conOperacion({ ...cuerpo, motivo: motivoValido(datos.motivo) }))}`);
      });
    }}>
      <fieldset disabled={operacion.ocupado} className="form presupuesto-distribucion">
        <legend>Datos del presupuesto</legend>
        <div className="form-row form-row--3">
          <Campo etiqueta="Nombre del presupuesto" valor={datos.nombre} cambiar={asignar("nombre")} maxLength={150} required />
          <Campo etiqueta="Finca (opcional, vacío para presupuesto general)" valor={datos.idFinca} cambiar={asignar("idFinca")} opciones={fincas} />
          <Campo etiqueta="Moneda" valor={datos.moneda} cambiar={asignar("moneda")} opciones={monedas} required />
          <Campo etiqueta="Fecha de inicio" valor={datos.fechaInicio} cambiar={asignar("fechaInicio")} type="date" required />
          <Campo etiqueta="Fecha de fin" valor={datos.fechaFin} cambiar={asignar("fechaFin")} type="date" min={datos.fechaInicio} required />
          {!p && <Campo etiqueta="Motivo de creación" valor={datos.motivo} cambiar={asignar("motivo")} maxLength={500} required />}
        </div>
        {partidas.map((fila, i) => <div className="form-row form-row--3" key={fila.clave}>
          <Campo etiqueta={`Rubro ${i + 1}`} valor={fila.idRubroPresupuesto} cambiar={asignarPartida(fila.clave, "idRubroPresupuesto")} required
            opciones={rubros.map((r) => ({ ...r, disabled: r.disabled || partidas.some((otra) => otra.clave !== fila.clave && String(otra.idRubroPresupuesto) === String(r.value)) }))} />
          <Campo etiqueta={`Monto inicial ${i + 1}`} valor={fila.monto} cambiar={asignarPartida(fila.clave, "monto")} formatoNumerico="decimal" required />
          {partidas.length > 1 && <div className="form-actions"><button type="button" className="btn btn--secondary"
            onClick={() => setPartidas((actual) => actual.filter((otra) => otra.clave !== fila.clave))}>Quitar partida {i + 1}</button></div>}
        </div>)}
        <div className="form-actions">
          <button type="button" className="btn btn--secondary" disabled={partidas.length >= Math.min(catalogos.rubros.filter((r) => r.activo).length, 100)}
            onClick={() => setPartidas((actual) => [...actual, partidaNueva()])}>Agregar partida</button>
          {p && <button type="button" className="btn btn--secondary" onClick={cancelar}>Cancelar edición</button>}
          <button className="btn btn--primary" disabled={!rubros.length}>{p ? "Guardar borrador" : "Crear borrador"}</button>
        </div>
      </fieldset>
      <Mensajes {...operacion} />
    </form>
  </Tarjeta>;
}
