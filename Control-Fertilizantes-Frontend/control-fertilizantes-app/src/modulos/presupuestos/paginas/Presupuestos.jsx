import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import Campo from "../../../componentes/comunes/Campo.jsx";
import Pagina, { EstadoConsulta, EstadoVacio, Mensajes, Tarjeta } from "../../../componentes/comunes/Pagina.jsx";
import useConsulta from "../../../hooks/useConsulta.js";
import useOperacion from "../../../hooks/useOperacion.js";
import { crearFinca, crearRubro, listarPresupuestos, obtenerCatalogos } from "../api/presupuestosApi.js";
import { fechaCorta, monedaVisible, monedas } from "../utils/presupuesto.js";
import FormularioPresupuesto from "../componentes/FormularioPresupuesto.jsx";

const estados = ["Borrador", "Aprobado", "Cerrado"].map((value) => ({ value, label: value }));

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
