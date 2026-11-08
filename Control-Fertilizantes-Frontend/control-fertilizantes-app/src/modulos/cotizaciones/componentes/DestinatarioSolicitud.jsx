import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { descargarArchivo } from "../../../api/cliente.js";
import { descargarSolicitudPdf, generarSolicitudPdf, listarRespuestas, recibirRespuesta, registrarEnvio } from "../api/cotizacionesApi.js";
import useConsulta from "../../../hooks/useConsulta.js";
import useOperacion from "../../../hooks/useOperacion.js";
import { mostrarConfirmacion } from "../../../utils/alertas.js";
import { fechaHora } from "../../../utils/datosApi.js";
import { etiquetaCotizacion } from "../utils/etiquetasCotizacion.js";
import Campo from "../../../componentes/comunes/Campo.jsx";
import Paginador from "../../../componentes/comunes/Paginador.jsx";
import { EstadoConsulta, EstadoVacio, Mensajes, Tarjeta } from "../../../componentes/comunes/Pagina.jsx";

const maximoPdf = 10 * 1024 * 1024;

export default function DestinatarioSolicitud({ solicitud, destino, refrescar }) {
  const [verRespuestas, setVerRespuestas] = useState(false);
  const [fechaEnvio, setFechaEnvio] = useState("");
  const [archivo, setArchivo] = useState(null);
  const navigate = useNavigate();
  const operacion = useOperacion();
  const id = solicitud.idSolicitudCotizacion;
  const idDestino = destino.idSolicitudCotizacionProveedor;
  const vigente = solicitud.estado === "Emitida" && destino.estado !== "Cancelada";

  function descargar() {
    operacion.ejecutar(async () => {
      if (!destino.idDocumentoGenerado) {
        await generarSolicitudPdf(id, idDestino);
        await refrescar();
      }
      const contenido = await descargarSolicitudPdf(id, idDestino);
      descargarArchivo(contenido, `Solicitud-${id}-v${solicitud.versionSolicitud}-dest-${idDestino}.pdf`);
    }, "PDF descargado.");
  }

  async function confirmarEnvio(e) {
    e.preventDefault();
    const confirmacion = await mostrarConfirmacion("Registrar envío",
      `Confirma que ya compartiste el PDF con ${destino.nombreProveedor}.`, "Registrar envío");
    if (!confirmacion.isConfirmed) return;
    operacion.ejecutar(async () => {
      await registrarEnvio(id, idDestino, fechaEnvio ? { fechaEnvio: new Date(fechaEnvio).toISOString() } : {});
      await refrescar();
    }, "Envío registrado.");
  }

  function cargarPdf(e) {
    e.preventDefault();
    operacion.ejecutar(async () => {
      if (!archivo || archivo.size === 0 || archivo.size > maximoPdf) {
        throw new Error("Selecciona un archivo PDF de hasta 10 MiB.");
      }
      const recibida = await recibirRespuesta(id, idDestino, archivo);
      navigate(`/respuestas/${recibida.respuesta.idProformaProveedor}`);
    });
  }

  return <Tarjeta titulo={destino.nombreProveedor}>
    <p>Estado: {etiquetaCotizacion(destino.estado)} · Envío: {fechaHora(destino.fechaEnvio)} · Respuestas: {destino.cantidadRespuestas}</p>
    <div className="form-actions">
      {(vigente || destino.idDocumentoGenerado) && <button className="btn btn--secondary" disabled={operacion.ocupado}
        onClick={descargar}>{destino.idDocumentoGenerado ? "Descargar PDF de solicitud" : "Generar y descargar PDF"}</button>}
      <button className="btn btn--secondary" aria-expanded={verRespuestas} onClick={() => setVerRespuestas((actual) => !actual)}>
        {verRespuestas ? "Ocultar respuestas" : "Ver respuestas"}
      </button>
    </div>
    {vigente && destino.idDocumentoGenerado && !destino.fechaEnvio && <form className="form" onSubmit={confirmarEnvio}>
      <Campo etiqueta="Fecha y hora del envío (opcional)" type="datetime-local"
        valor={fechaEnvio} cambiar={setFechaEnvio} disabled={operacion.ocupado} />
      <div className="form-actions"><button className="btn btn--secondary" disabled={operacion.ocupado}>Registrar envío</button></div>
    </form>}
    {vigente && <form className="form" onSubmit={cargarPdf}>
      <label className="form-label">PDF devuelto por el proveedor
        <input className="input" type="file" accept=".pdf,application/pdf" required disabled={operacion.ocupado}
          onChange={(e) => setArchivo(e.target.files[0] ?? null)} />
      </label>
      <div className="form-actions"><button className="btn btn--primary" disabled={operacion.ocupado}>Cargar proforma</button></div>
    </form>}
    <Mensajes {...operacion} />
    {verRespuestas && <RespuestasDestinatario id={id} idDestino={idDestino} />}
  </Tarjeta>;
}

function RespuestasDestinatario({ id, idDestino }) {
  const tamanoPagina = 20;
  const [pagina, setPagina] = useState(1);
  const cargar = useCallback((signal) => listarRespuestas(id, idDestino, { pagina, tamanoPagina }, signal), [id, idDestino, pagina]);
  const estado = useConsulta(cargar);
  return <EstadoConsulta estado={estado}>
    {estado.datos && <>
      {estado.datos.elementos.length === 0 ? <EstadoVacio mensaje="No hay respuestas en esta página." /> : <ul>
        {estado.datos.elementos.map((r) => <li key={r.idProformaProveedor}>
          <Link to={`/respuestas/${r.idProformaProveedor}`}>
            {r.numeroProforma || "Proforma sin número"} · versión {r.versionRespuesta} · {etiquetaCotizacion(r.estado)}
          </Link>
        </li>)}
      </ul>}
      <Paginador paginaActual={pagina} totalPaginas={Math.ceil(estado.datos.totalRegistros / tamanoPagina)}
        irAPagina={setPagina} etiqueta="Paginación de respuestas" />
    </>}
  </EstadoConsulta>;
}
