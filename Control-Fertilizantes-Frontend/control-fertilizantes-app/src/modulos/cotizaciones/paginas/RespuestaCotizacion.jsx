import { formatearNumero } from "../../../utils/numeros.js";
import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Pagina, { EstadoConsulta, Mensajes, Tarjeta } from "../../../componentes/comunes/Pagina.jsx";
import EditorCabecera from "../componentes/EditorCabecera.jsx";
import PendientesCabecera from "../componentes/PendientesCabecera.jsx";
import EditorLineaRespuesta from "../componentes/EditorLineaRespuesta.jsx";
import EvidenciaRespuesta from "../componentes/EvidenciaRespuesta.jsx";
import PanelPdfRespuesta from "../componentes/PanelPdfRespuesta.jsx";
import { Conciliacion, MotivoAccion } from "../componentes/AccionesRevision.jsx";
import useConsulta from "../../../hooks/useConsulta.js";
import useOperacion from "../../../hooks/useOperacion.js";
import { ajustarCabecera, cancelarRespuesta, conciliarRespuesta, confirmarLinea, guardarLineaRespuesta,
  obtenerRespuesta, obtenerSolicitud, revisarRespuesta, validarRespuesta } from "../api/cotizacionesApi.js";
import { mostrarConfirmacion } from "../../../utils/alertas.js";
import { mismoId, mostrarDato } from "../../../utils/datosApi.js";
import { camposPendientesCabecera } from "../utils/formularioRespuesta.js";
import { etiquetaConciliacion, etiquetaCotizacion } from "../utils/etiquetasCotizacion.js";

export default function RespuestaCotizacion() {
  const params = useParams();
  const id = params.id ?? params.idProformaProveedor;
  const cargar = useCallback(async (signal) => {
    const datos = await obtenerRespuesta(id, signal);
    return { datos, solicitud: await obtenerSolicitud(datos.respuesta.idSolicitudCotizacion, signal) };
  }, [id]);
  const estado = useConsulta(cargar);
  const recurso = estado.datos;

  return <Pagina titulo={recurso ? `Proforma de ${recurso.datos.respuesta.nombreProveedor}` : "Proforma del proveedor"}
    acciones={<Link className="btn btn--secondary" to={recurso ? `/solicitudes/${recurso.solicitud.idSolicitudCotizacion}` : "/solicitudes"}>Volver a la solicitud</Link>}>
    <EstadoConsulta estado={estado}>
      {recurso && <RevisionRespuesta key={id} id={id} {...recurso}
        actualizar={(datos) => estado.actualizar({ ...recurso, datos })} />}
    </EstadoConsulta>
  </Pagina>;
}

function RevisionRespuesta({ id, datos, solicitud, actualizar }) {
  const [editarCabecera, setEditarCabecera] = useState(false);
  const [editarLinea, setEditarLinea] = useState(null);
  const [cancelar, setCancelar] = useState(false);
  const operacion = useOperacion();
  const navigate = useNavigate();
  const { respuesta, cabecera, lineas } = datos;
  const editable = solicitud.estado === "Emitida" && ["Borrador", "EnRevision"].includes(respuesta.estado);
  const editorAbierto = editarCabecera || editarLinea !== null || cancelar;
  const pendientesCabecera = camposPendientesCabecera(cabecera);
  const renglonesPendientes = lineas.filter((l) => l.estadoRevision !== "Revisada").length;
  const puedeValidar = solicitud.estado === "Emitida" && respuesta.estadoConciliacion !== "Pendiente" && lineas.length > 0
    && renglonesPendientes === 0 && pendientesCabecera.length === 0;
  const lineaActual = lineas.find((l) => mismoId(l.idProformaProveedorDetalle, editarLinea));

  function aplicar(accion, mensaje, alGuardar) {
    operacion.ejecutar(async () => {
      actualizar(await accion());
      alGuardar?.();
    }, mensaje);
  }

  async function validar() {
    if (!(await mostrarConfirmacion("Validar respuesta", "La versión quedará lista para comparar. Para corregirla luego tendrás que crear una revisión.", "Validar")).isConfirmed) return;
    aplicar(() => validarRespuesta(id), "Respuesta validada.");
  }

  async function nuevaRevision() {
    if (!(await mostrarConfirmacion("Crear revisión", "Se conservarán el PDF y la extracción original.", "Crear revisión")).isConfirmed) return;
    operacion.ejecutar(async () => {
      const revision = await revisarRespuesta(id);
      navigate(`/respuestas/${revision.respuesta.idProformaProveedor}`);
    });
  }

  return <>
    <Tarjeta titulo="Revisión de la respuesta">
      <p>Solicitud {solicitud.numeroSolicitud} · versión de respuesta {respuesta.versionRespuesta} · {etiquetaCotizacion(respuesta.estado)}</p>
      {respuesta.idProformaAnterior && <Link to={`/respuestas/${respuesta.idProformaAnterior}`}>Consultar la versión anterior</Link>}
      <div className="form-actions">
        {editable && <>
          <button type="button" className="btn btn--primary" disabled={operacion.ocupado || editorAbierto || !puedeValidar} onClick={validar}>Validar respuesta</button>
          <button type="button" className="btn btn--secondary" disabled={operacion.ocupado} onClick={() => setCancelar(true)}>Cancelar borrador</button>
        </>}
        {!editable && solicitud.estado === "Emitida" && <button type="button" className="btn btn--secondary" disabled={operacion.ocupado} onClick={nuevaRevision}>Crear revisión</button>}
        <Link className="btn btn--secondary" to={`/solicitudes/${solicitud.idSolicitudCotizacion}/comparacion`}
          aria-disabled={operacion.ocupado || editorAbierto}
          onClick={(evento) => { if (operacion.ocupado || editorAbierto) evento.preventDefault(); }}>Comparar ofertas</Link>
      </div>
      {editable && !puedeValidar && <section aria-label="Pendientes para validar">
        <p><strong>Antes de validar esta respuesta:</strong></p>
        <ul>
          {pendientesCabecera.length > 0 && <li>Completa los datos pendientes de la cabecera, indicados abajo.</li>}
          {lineas.length === 0 && <li>Agrega al menos un renglón de respuesta.</li>}
          {renglonesPendientes > 0 && <li>Confirma la revisión de {renglonesPendientes} {renglonesPendientes === 1 ? "renglón pendiente" : "renglones pendientes"}.</li>}
          {respuesta.estadoConciliacion === "Pendiente" && <li>Comprueba los importes o justifica sus diferencias en «Conciliación de importes».</li>}
        </ul>
      </section>}
      {editable && puedeValidar && editorAbierto && <p>Guarda o cierra los formularios abiertos antes de validar.</p>}
      {editorAbierto && <p>Guarda o cancela la edición antes de abrir la comparación.</p>}
      {editable && cancelar && <MotivoAccion etiqueta="Motivo de cancelación" boton="Confirmar cancelación" ocupado={operacion.ocupado}
        cerrar={() => setCancelar(false)} ejecutar={(motivo) => aplicar(() => cancelarRespuesta(id, motivo), "Borrador cancelado.", () => setCancelar(false))} />}
    </Tarjeta>
    <div className="revision-proforma" data-con-documento={Boolean(datos.documento)}>
      {datos.documento && <aside className="revision-proforma__pdf" aria-label="Documento original">
        <PanelPdfRespuesta id={id} documento={datos.documento} />
      </aside>}
      <div className="revision-proforma__datos">
        <Tarjeta titulo="Cabecera de la proforma">
          {editable && !editarCabecera && <PendientesCabecera campos={pendientesCabecera} />}
          <p>Número: {mostrarDato(cabecera.numeroProforma)} · Moneda: {mostrarDato(cabecera.moneda)} · Fecha: {mostrarDato(cabecera.fechaProforma)} · Vence: {mostrarDato(cabecera.fechaVencimiento)}</p>
          <p>Subtotal: {formatearNumero(cabecera.subtotal)} · Descuento: {formatearNumero(cabecera.descuento)} · IVA: {formatearNumero(cabecera.iva)} · Otros cargos: {formatearNumero(cabecera.otrosCargos)} · Total: {formatearNumero(cabecera.total)}</p>
          <p>Pago: {mostrarDato(cabecera.condicionesPago)} · Entrega: {mostrarDato(cabecera.condicionesEntrega)}</p>
          {editable && (editarCabecera ? <EditorCabecera cabecera={cabecera} respuesta={respuesta} solicitud={solicitud} ocupado={operacion.ocupado}
            cerrar={() => setEditarCabecera(false)} guardar={(cuerpo) => aplicar(() => ajustarCabecera(id, cuerpo()),
              "Cabecera guardada.", () => setEditarCabecera(false))} />
            : <button type="button" className="btn btn--secondary" disabled={operacion.ocupado} onClick={() => setEditarCabecera(true)}>Editar cabecera</button>)}
          {!editable && <p>Conciliación: {etiquetaConciliacion(respuesta.estadoConciliacion)}{respuesta.justificacionConciliacion && ` · ${respuesta.justificacionConciliacion}`}</p>}
        </Tarjeta>
        <Tarjeta titulo="Renglones de la respuesta">
          <div className="table-wrapper">
            <table className="table table--compact revision-proforma__tabla"><thead><tr><th>Renglón</th><th>Oferta</th><th>Empaques</th><th>Precio por empaque</th><th>Total de línea</th><th>Revisión</th>{editable && <th>Acciones</th>}</tr></thead>
              <tbody>{lineas.map((l, indice) => {
                const pedida = solicitud.lineas.find((p) => mismoId(p.idSolicitudCotizacionDetalle, l.idSolicitudDetalle));
                const numero = l.numeroLinea ?? pedida?.numeroLinea ?? indice + 1;
                const llave = l.idProformaProveedorDetalle;
                return <tr key={llave}>
                  <td>{numero} · {l.descripcion || l.nombreProductoOriginal || pedida?.nombreProductoOriginal || "Sin descripción"}
                    {l.presentacionOriginal && <p>{l.presentacionOriginal}</p>}</td>
                  <td>{etiquetaCotizacion(l.tipoOferta)} · {etiquetaCotizacion(l.estadoOferta)}{l.estadoOferta === "Cotizada" && <p>{etiquetaCotizacion(l.baseTotalLinea)}</p>}</td>
                  <td>{formatearNumero(l.cantidadEmpaques)}</td><td>{formatearNumero(l.precioUnitario)}</td><td>{formatearNumero(l.totalLinea)}</td>
                  <td>{l.estadoRevision}</td>
                  {editable && <td>
                    <button type="button" className="btn btn--secondary btn--sm" disabled={operacion.ocupado}
                      onClick={() => setEditarLinea(llave)}>Editar renglón {numero}</button>{" "}
                    <button type="button" className="btn btn--secondary btn--sm" disabled={operacion.ocupado || editorAbierto || l.estadoRevision === "Revisada"}
                      onClick={() => aplicar(() => confirmarLinea(id, llave), "Renglón revisado.")}>Revisar renglón {numero}</button>
                  </td>}
                </tr>;
              })}</tbody>
            </table>
          </div>
          {editable && <button type="button" className="btn btn--secondary" disabled={operacion.ocupado || lineas.length >= 200}
            onClick={() => setEditarLinea("nueva")}>Agregar renglón de respuesta</button>}
          {editable && editarLinea !== null && <EditorLineaRespuesta key={editarLinea} linea={lineaActual} solicitud={solicitud}
            ocupado={operacion.ocupado} cerrar={() => setEditarLinea(null)}
            guardar={(cuerpo) => aplicar(() => guardarLineaRespuesta(id, lineaActual?.idProformaProveedorDetalle, cuerpo()),
              "Renglón guardado. Confirma su revisión.", () => setEditarLinea(null))} />}
        </Tarjeta>
        {editable && <Conciliacion resumen={respuesta} ocupado={operacion.ocupado}
          guardar={(cuerpo, cerrar) => aplicar(() => conciliarRespuesta(id, cuerpo()), "Conciliación registrada.", cerrar)} />}
        <Mensajes {...operacion} />
        <EvidenciaRespuesta datos={datos} />
      </div>
    </div>
  </>;
}
