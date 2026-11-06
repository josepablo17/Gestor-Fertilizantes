import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import Campo from "../componentes/comunes/Campo.jsx";
import Pagina, { EstadoConsulta, Tarjeta } from "../componentes/comunes/Pagina.jsx";
import useConsulta from "../hooks/useConsulta.js";
import { listarSolicitudes } from "../api/cotizacionesApi.js";

const estados = ["Borrador", "Emitida", "Cerrada", "Cancelada"].map((value) => ({ value, label: value }));
const porPagina = 20;

export default function Solicitudes() {
  const [buscar, setBuscar] = useState("");
  const [estado, setEstado] = useState("");
  const [filtros, setFiltros] = useState({ buscar: "", estado: "", pagina: 1, tamanoPagina: porPagina });
  const cargar = useCallback((signal) => listarSolicitudes(filtros, signal), [filtros]);
  const lista = useConsulta(cargar);

  return <Pagina titulo="Solicitudes de cotización" descripcion="Solicita ofertas, recibe los PDF y compara las respuestas validadas."
    acciones={<Link className="btn btn--primary" to="/solicitudes/nueva">Nueva solicitud</Link>}>
    <Tarjeta>
      <form className="form" onSubmit={(e) => { e.preventDefault(); setFiltros({ buscar: buscar.trim(), estado, pagina: 1, tamanoPagina: porPagina }); }}>
        <div className="form-row">
          <Campo etiqueta="Buscar por número" valor={buscar} cambiar={setBuscar} maxLength={50} />
          <Campo etiqueta="Estado (opcional)" valor={estado} cambiar={setEstado} opciones={estados} />
        </div>
        <div className="form-actions"><button className="btn btn--secondary">Buscar</button></div>
      </form>
    </Tarjeta>
    <EstadoConsulta estado={lista}>
      {lista.datos && <Tarjeta titulo="Solicitudes">
        {lista.datos.elementos.length === 0 ? <p>No hay solicitudes para estos filtros.</p> : <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Número</th><th>Versión</th><th>Fecha</th><th>Estado</th><th>Renglones</th><th>Proveedores</th><th>Acción</th></tr></thead>
            <tbody>{lista.datos.elementos.map((solicitud) => <tr key={solicitud.idSolicitudCotizacion}>
              <td>{solicitud.numeroSolicitud}</td><td>{solicitud.versionSolicitud}</td><td>{solicitud.fechaSolicitud}</td><td>{solicitud.estado}</td>
              <td>{solicitud.cantidadLineas}</td><td>{solicitud.cantidadProveedores}</td>
              <td><Link to={`/solicitudes/${solicitud.idSolicitudCotizacion}`} aria-label={`Abrir solicitud ${solicitud.numeroSolicitud} versión ${solicitud.versionSolicitud}`}>Abrir</Link></td>
            </tr>)}</tbody>
          </table>
        </div>}
        <div className="form-actions">
          <button className="btn btn--secondary" disabled={filtros.pagina <= 1}
            onClick={() => setFiltros({ ...filtros, pagina: filtros.pagina - 1 })}>Anterior</button>
          <span>Página {filtros.pagina}</span>
          <button className="btn btn--secondary" disabled={filtros.pagina * porPagina >= lista.datos.totalRegistros}
            onClick={() => setFiltros({ ...filtros, pagina: filtros.pagina + 1 })}>Siguiente</button>
        </div>
      </Tarjeta>}
    </EstadoConsulta>
  </Pagina>;
}
