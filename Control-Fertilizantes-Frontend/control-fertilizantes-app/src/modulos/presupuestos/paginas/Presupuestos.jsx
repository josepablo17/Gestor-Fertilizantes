import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Campo from "../../../componentes/comunes/Campo.jsx";
import Pagina, { EstadoConsulta, EstadoVacio, Mensajes, Tarjeta } from "../../../componentes/comunes/Pagina.jsx";
import useConsulta from "../../../hooks/useConsulta.js";
import useOperacion from "../../../hooks/useOperacion.js";
import { fechaLocal } from "../../../utils/datosApi.js";
import { crearFinca, crearPresupuesto, crearRubro, listarPresupuestos, obtenerCatalogos } from "../api/presupuestosApi.js";
import useIdOperacion from "../hooks/useIdOperacion.js";
import { fechaCorta, importePositivo, monedaVisible, monedas, motivoValido } from "../utils/presupuesto.js";

const estados = ["Borrador", "Aprobado", "Cerrado"].map((value) => ({ value, label: value }));
const rubrosActivos = (rubros) => rubros.filter((r) => r.activo)
  .map((r) => ({ value: r.idRubroPresupuesto, label: r.nombre }));
const fincasActivas = (fincas) => fincas.filter((f) => f.activa)
  .map((f) => ({ value: f.idFinca, label: f.nombre }));
const partidaNueva = () => ({ clave: crypto.randomUUID(), idRubroPresupuesto: "", monto: "" });

export default function Presupuestos() {
  const [filtros, setFiltros] = useState({ idFinca: "", moneda: "", estado: "" });
  const [creando, setCreando] = useState(false);
  const catalogos = useConsulta(obtenerCatalogos);
  const cargar = useCallback((signal) => listarPresupuestos(filtros, signal), [filtros]);
  const lista = useConsulta(cargar);
  const asignar = (campo) => (valor) => setFiltros((actual) => ({ ...actual, [campo]: valor }));

  return <Pagina titulo="Presupuestos" descripcion="Controla lo aprobado, lo reservado y lo gastado por finca y rubro."
    acciones={<button type="button" className="btn btn--primary" onClick={() => setCreando(!creando)}>
      {creando ? "Ocultar formulario" : "Nuevo presupuesto"}
    </button>}>
    <EstadoConsulta estado={catalogos}>
      {catalogos.datos && creando && <FormularioPresupuesto catalogos={catalogos.datos} />}
      <Tarjeta titulo="Catálogos de presupuesto">
        <div className="form-row">
          <FormularioCatalogo tipo="finca" guardar={crearFinca} alGuardar={catalogos.actualizar} datos={catalogos.datos} />
          <FormularioCatalogo tipo="rubro" guardar={crearRubro} alGuardar={catalogos.actualizar} datos={catalogos.datos} />
        </div>
      </Tarjeta>
      <Tarjeta titulo="Presupuestos registrados">
        <div className="form-row form-row--3">
          <Campo etiqueta="Filtrar por finca" valor={filtros.idFinca} cambiar={asignar("idFinca")}
            opciones={(catalogos.datos?.fincas ?? []).map((f) => ({ value: f.idFinca, label: f.nombre }))} />
          <Campo etiqueta="Filtrar por moneda" valor={filtros.moneda} cambiar={asignar("moneda")} opciones={monedas} />
          <Campo etiqueta="Filtrar por estado" valor={filtros.estado} cambiar={asignar("estado")} opciones={estados} />
        </div>
        <EstadoConsulta estado={lista}>
          {!lista.datos?.length ? <EstadoVacio mensaje="No hay presupuestos para estos filtros." /> :
            <div className="table-wrapper"><table className="table">
              <thead><tr><th>Presupuesto</th><th>Finca</th><th>Período</th><th>Estado</th>
                <th>Aprobado</th><th>Comprometido</th><th>Ejecutado</th><th>Disponible</th></tr></thead>
              <tbody>{lista.datos.map((p) => <tr key={p.idPresupuesto}>
                <td><Link to={`/presupuestos/${p.idPresupuesto}`}>{p.nombre}</Link></td>
                <td>{p.finca ?? "General"}</td><td>{fechaCorta(p.fechaInicio)} a {fechaCorta(p.fechaFin)}</td>
                <td>{p.estado}</td>
                {[p.aprobado, p.comprometido, p.ejecutado, p.disponible].map((m, i) => <td key={i}>{monedaVisible(m, p.moneda)}</td>)}
              </tr>)}</tbody>
            </table></div>}
        </EstadoConsulta>
      </Tarjeta>
    </EstadoConsulta>
  </Pagina>;
}

function FormularioCatalogo({ tipo, guardar, alGuardar, datos }) {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const operacion = useOperacion();

  return <details>
    <summary>Registrar {tipo}</summary>
    <form className="form" onSubmit={(e) => {
      e.preventDefault();
      operacion.ejecutar(async () => {
        await guardar({ codigo: codigo.trim(), nombre: nombre.trim() });
        setCodigo("");
        setNombre("");
        alGuardar(await obtenerCatalogos());
      }, "Catálogo actualizado.");
    }}>
      <Campo etiqueta={`Código de ${tipo}`} valor={codigo} cambiar={setCodigo} maxLength={30} required />
      <Campo etiqueta={`Nombre de ${tipo}`} valor={nombre} cambiar={setNombre} maxLength={150} required />
      <button className="btn btn--secondary" disabled={operacion.ocupado || !datos}>Guardar {tipo}</button>
      <Mensajes {...operacion} />
    </form>
  </details>;
}

function FormularioPresupuesto({ catalogos }) {
  const [datos, setDatos] = useState(() => ({
    nombre: "", fechaInicio: fechaLocal(), fechaFin: "", moneda: "CRC", idFinca: "", motivo: "",
  }));
  const [partidas, setPartidas] = useState(() => [partidaNueva()]);
  const operacion = useOperacion();
  const { conOperacion } = useIdOperacion();
  const navegar = useNavigate();
  const asignar = (campo) => (valor) => setDatos((actual) => ({ ...actual, [campo]: valor }));
  const asignarPartida = (clave, campo) => (valor) =>
    setPartidas((actual) => actual.map((p) => p.clave === clave ? { ...p, [campo]: valor } : p));
  const rubros = rubrosActivos(catalogos.rubros);

  return <Tarjeta titulo="Nuevo presupuesto">
    {rubros.length === 0 && <p>Registra un rubro antes de crear el presupuesto.</p>}
    <form className="form" onSubmit={(e) => {
      e.preventDefault();
      operacion.ejecutar(async () => {
        const id = await crearPresupuesto(conOperacion({
          ...datos, nombre: datos.nombre.trim(), motivo: motivoValido(datos.motivo), idFinca: datos.idFinca || null,
          partidas: partidas.map((p) => ({ idRubroPresupuesto: p.idRubroPresupuesto, monto: importePositivo(p.monto) })),
        }));
        navegar(`/presupuestos/${id}`);
      });
    }}>
      <fieldset disabled={operacion.ocupado} className="form presupuesto-distribucion">
        <legend>Datos del presupuesto</legend>
        <div className="form-row form-row--3">
          <Campo etiqueta="Nombre del presupuesto" valor={datos.nombre} cambiar={asignar("nombre")} maxLength={150} required />
          <Campo etiqueta="Finca (opcional, vacío para presupuesto general)" valor={datos.idFinca} cambiar={asignar("idFinca")}
            opciones={fincasActivas(catalogos.fincas)} />
          <Campo etiqueta="Moneda" valor={datos.moneda} cambiar={asignar("moneda")} opciones={monedas} required />
          <Campo etiqueta="Fecha de inicio" valor={datos.fechaInicio} cambiar={asignar("fechaInicio")} type="date" required />
          <Campo etiqueta="Fecha de fin" valor={datos.fechaFin} cambiar={asignar("fechaFin")} type="date" min={datos.fechaInicio} required />
          <Campo etiqueta="Motivo de creación" valor={datos.motivo} cambiar={asignar("motivo")} maxLength={500} required />
        </div>
        {partidas.map((p, i) => <div className="form-row form-row--3" key={p.clave}>
          <Campo etiqueta={`Rubro ${i + 1}`} valor={p.idRubroPresupuesto} cambiar={asignarPartida(p.clave, "idRubroPresupuesto")} required
            opciones={rubros.map((r) => ({ ...r, disabled: partidas.some((otra) => otra.clave !== p.clave && otra.idRubroPresupuesto === String(r.value)) }))} />
          <Campo etiqueta={`Monto inicial ${i + 1}`} valor={p.monto} cambiar={asignarPartida(p.clave, "monto")} formatoNumerico="decimal" required />
          {partidas.length > 1 && <div className="form-actions"><button type="button" className="btn btn--secondary"
            onClick={() => setPartidas(partidas.filter((otra) => otra.clave !== p.clave))}>Quitar partida {i + 1}</button></div>}
        </div>)}
        <div className="form-actions">
          <button type="button" className="btn btn--secondary" disabled={partidas.length >= Math.min(rubros.length, 100)}
            onClick={() => setPartidas([...partidas, partidaNueva()])}>Agregar partida</button>
          <button className="btn btn--primary" disabled={!rubros.length}>Crear borrador</button>
        </div>
      </fieldset>
      <Mensajes {...operacion} />
    </form>
  </Tarjeta>;
}
