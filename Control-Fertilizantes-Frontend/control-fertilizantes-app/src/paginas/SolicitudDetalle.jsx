import { useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Pagina, { EstadoConsulta, Mensajes, Tarjeta } from "../componentes/comunes/Pagina.jsx";
import DestinatarioSolicitud from "../componentes/solicitudes/DestinatarioSolicitud.jsx";
import useConsulta from "../hooks/useConsulta.js";
import useOperacion from "../hooks/useOperacion.js";
import { cambiarEstadoSolicitud, emitirSolicitud, obtenerSolicitud, revisarSolicitud } from "../api/cotizacionesApi.js";
import { mostrarConfirmacion } from "../utils/alertas.js";
import { fechaHora, mostrarDato } from "../utils/datosApi.js";

export default function SolicitudDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cargar = useCallback((signal) => obtenerSolicitud(id, signal), [id]);
  const estado = useConsulta(cargar);
  const operacion = useOperacion();
  const solicitud = estado.datos;
  const ruta = `/solicitudes/${id}`;

  async function confirmar(titulo, texto, boton, accion) {
    if (!(await mostrarConfirmacion(titulo, texto, boton)).isConfirmed) return;
    operacion.ejecutar(accion);
  }

  async function refrescar() {
    estado.actualizar(await obtenerSolicitud(id));
  }

  const esBorrador = solicitud?.estado === "Borrador";
  const esEmitida = solicitud?.estado === "Emitida";
  return <Pagina titulo={solicitud ? `Solicitud ${solicitud.numeroSolicitud} · versión ${solicitud.versionSolicitud}` : "Solicitud"}
    acciones={<Link className="btn btn--secondary" to="/solicitudes">Volver a solicitudes</Link>}>
    <EstadoConsulta estado={estado}>
      {solicitud && <>
        <Tarjeta titulo="Datos de la solicitud">
          <p>Estado: {solicitud.estado} · Fecha: {solicitud.fechaSolicitud} · Límite: {mostrarDato(solicitud.fechaLimiteRespuesta)}</p>
          <p>Cliente: {mostrarDato(solicitud.datosCliente?.nombre)} · Emisión: {fechaHora(solicitud.fechaEmision)}</p>
          {solicitud.observaciones && <p>{solicitud.observaciones}</p>}
          {solicitud.idSolicitudAnterior && <p><Link to={`/solicitudes/${solicitud.idSolicitudAnterior}`}>Consultar la versión anterior</Link></p>}
          <div className="form-actions">
            {esBorrador && <>
              <Link className="btn btn--secondary" to={`${ruta}/editar`}>Editar borrador</Link>
              <button className="btn btn--primary" disabled={operacion.ocupado} onClick={() => confirmar(
                "Emitir solicitud", "La emisión fija los renglones y destinatarios de esta versión.", "Emitir",
                async () => estado.actualizar(await emitirSolicitud(id)),
              )}>Emitir solicitud</button>
            </>}
            {!esBorrador && <>
              <Link className="btn btn--primary" to={`${ruta}/comparacion`}>Comparar ofertas</Link>
              <button className="btn btn--secondary" disabled={operacion.ocupado} onClick={() => confirmar(
                "Crear revisión", "Se abrirá un borrador con una nueva versión de la solicitud.", "Crear revisión",
                async () => navigate(`/solicitudes/${(await revisarSolicitud(id)).idSolicitudCotizacion}`),
              )}>Crear revisión</button>
            </>}
            {esEmitida && <button className="btn btn--secondary" disabled={operacion.ocupado} onClick={() => confirmar(
              "Cerrar solicitud", "Se conservarán las respuestas recibidas.", "Cerrar solicitud",
              async () => estado.actualizar(await cambiarEstadoSolicitud(id, "Cerrada")),
            )}>Cerrar solicitud</button>}
            {(esBorrador || esEmitida) && <button className="btn btn--secondary" disabled={operacion.ocupado} onClick={() => confirmar(
              "Cancelar solicitud", "Esta versión quedará cancelada.", "Cancelar solicitud",
              async () => estado.actualizar(await cambiarEstadoSolicitud(id, "Cancelada")),
            )}>Cancelar solicitud</button>}
          </div>
          <Mensajes {...operacion} />
        </Tarjeta>
        <Tarjeta titulo="Renglones">
          {solicitud.lineas.length === 0 ? <p>No hay renglones.</p> : <div className="table-wrapper">
            <table className="table"><thead><tr><th>#</th><th>Producto</th><th>Presentación</th><th>Empaques</th><th>Alternativas</th></tr></thead>
              <tbody>{solicitud.lineas.map((l) => <tr key={l.idSolicitudCotizacionDetalle}>
                <td>{l.numeroLinea}</td><td>{l.nombreProductoOriginal}{l.marcaOriginal && ` · ${l.marcaOriginal}`}</td>
                <td>{l.presentacionOriginal} · {l.contenidoEmpaqueOriginal} {l.codigoUnidadOriginal}</td>
                <td>{l.cantidadEmpaquesSolicitada}</td><td>{l.permiteAlternativas ? "Permitidas" : "No permitidas"}</td>
              </tr>)}</tbody>
            </table>
          </div>}
        </Tarjeta>
        {solicitud.destinatarios.length === 0 ? <Tarjeta titulo="Destinatarios"><p>No hay proveedores seleccionados.</p></Tarjeta>
          : solicitud.destinatarios.map((destino) => <DestinatarioSolicitud key={destino.idSolicitudCotizacionProveedor}
            solicitud={solicitud} destino={destino} refrescar={refrescar} />)}
      </>}
    </EstadoConsulta>
  </Pagina>;
}
