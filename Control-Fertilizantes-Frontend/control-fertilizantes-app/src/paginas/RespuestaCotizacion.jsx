import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Pagina, { EstadoConsulta, Mensajes, Tarjeta } from "../componentes/comunes/Pagina.jsx";
import EditorCabecera from "../componentes/respuestas/EditorCabecera.jsx";
import EditorLineaRespuesta from "../componentes/respuestas/EditorLineaRespuesta.jsx";
import EvidenciaRespuesta from "../componentes/respuestas/EvidenciaRespuesta.jsx";
import { Conciliacion, MotivoAccion } from "../componentes/respuestas/AccionesRevision.jsx";
import useConsulta from "../hooks/useConsulta.js";
import useOperacion from "../hooks/useOperacion.js";
import { ajustarCabecera, cancelarRespuesta, conciliarRespuesta, confirmarLinea, guardarLineaRespuesta,
  obtenerRespuesta, obtenerSolicitud, revisarRespuesta, validarRespuesta } from "../api/cotizacionesApi.js";
import { mostrarConfirmacion } from "../utils/alertas.js";
import { mismoId, mostrarDato } from "../utils/datosApi.js";

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
  const [revisarLinea, setRevisarLinea] = useState(null);
  const [cancelar, setCancelar] = useState(false);
  const operacion = useOperacion();
  const navigate = useNavigate();
  const { respuesta, cabecera, lineas } = datos;
  const editable = ["Borrador", "EnRevision"].includes(respuesta.estado);
  const editorAbierto = editarCabecera || editarLinea !== null || revisarLinea !== null || cancelar;
  const puedeValidar = solicitud.estado === "Emitida" && respuesta.estadoConciliacion !== "Pendiente" && lineas.length > 0
    && lineas.every((l) => l.estadoRevision === "Revisada") && cabecera.fechaProforma && cabecera.moneda
    && cabecera.datosClienteOriginal && cabecera.datosProveedorOriginal;
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
      <p>Solicitud {solicitud.numeroSolicitud} · versión de respuesta {respuesta.versionRespuesta} · {respuesta.estado}</p>
      {respuesta.idProformaAnterior && <Link to={`/respuestas/${respuesta.idProformaAnterior}`}>Consultar la versión anterior</Link>}
      <div className="form-actions">
        {editable && <>
          <button type="button" className="btn btn--primary" disabled={operacion.ocupado || editorAbierto || !puedeValidar} onClick={validar}>Validar respuesta</button>
          <button type="button" className="btn btn--secondary" disabled={operacion.ocupado} onClick={() => setCancelar(true)}>Cancelar borrador</button>
        </>}
        {!editable && solicitud.estado === "Emitida" && <button type="button" className="btn btn--secondary" disabled={operacion.ocupado} onClick={nuevaRevision}>Crear revisión</button>}
        <Link className="btn btn--secondary" to={`/solicitudes/${solicitud.idSolicitudCotizacion}/comparacion`}>Comparar ofertas</Link>
      </div>
      {editable && !puedeValidar && <p>Para validar, completa la cabecera y los datos de ambas partes, confirma todos los renglones y concilia los importes.</p>}
      {editable && puedeValidar && editorAbierto && <p>Guarda o cierra los formularios abiertos antes de validar.</p>}
      {editable && cancelar && <MotivoAccion etiqueta="Motivo de cancelación" boton="Confirmar cancelación" ocupado={operacion.ocupado}
        cerrar={() => setCancelar(false)} ejecutar={(motivo) => aplicar(() => cancelarRespuesta(id, motivo), "Borrador cancelado.", () => setCancelar(false))} />}
    </Tarjeta>
    <EvidenciaRespuesta datos={datos} />
    <Tarjeta titulo="Cabecera de la proforma">
      <p>Número: {mostrarDato(cabecera.numeroProforma)} · Moneda: {mostrarDato(cabecera.moneda)} · Fecha: {mostrarDato(cabecera.fechaProforma)} · Vence: {mostrarDato(cabecera.fechaVencimiento)}</p>
      <p>Subtotal: {mostrarDato(cabecera.subtotal)} · Descuento: {mostrarDato(cabecera.descuento)} · IVA: {mostrarDato(cabecera.iva)} · Otros cargos: {mostrarDato(cabecera.otrosCargos)} · Total: {mostrarDato(cabecera.total)}</p>
      <p>Pago: {mostrarDato(cabecera.condicionesPago)} · Entrega: {mostrarDato(cabecera.condicionesEntrega)}</p>
      {editable && (editarCabecera ? <EditorCabecera cabecera={cabecera} ocupado={operacion.ocupado}
        cerrar={() => setEditarCabecera(false)} guardar={(cuerpo) => aplicar(() => ajustarCabecera(id, cuerpo()),
          "Cabecera actualizada. Vuelve a conciliar los importes.", () => setEditarCabecera(false))} />
        : <button type="button" className="btn btn--secondary" disabled={operacion.ocupado} onClick={() => setEditarCabecera(true)}>Editar cabecera</button>)}
      {!editable && <p>Conciliación: {respuesta.estadoConciliacion}{respuesta.justificacionConciliacion && ` · ${respuesta.justificacionConciliacion}`}</p>}
    </Tarjeta>
    <Tarjeta titulo="Renglones de la respuesta">
      <div className="table-wrapper">
        <table className="table"><thead><tr><th>Renglón</th><th>Oferta</th><th>Empaques</th><th>Precio por empaque</th><th>Total de línea</th><th>Revisión</th>{editable && <th>Acciones</th>}</tr></thead>
          <tbody>{lineas.map((l, indice) => {
            const pedida = solicitud.lineas.find((p) => mismoId(p.idSolicitudCotizacionDetalle, l.idSolicitudDetalle));
            const numero = l.numeroLinea ?? pedida?.numeroLinea ?? indice + 1;
            const llave = l.idProformaProveedorDetalle;
            return <tr key={llave}>
              <td>{numero} · {l.descripcion || l.nombreProductoOriginal || pedida?.nombreProductoOriginal || "Sin descripción"}
                {l.presentacionOriginal && <p>{l.presentacionOriginal}</p>}</td>
              <td>{l.tipoOferta} · {l.estadoOferta}{l.estadoOferta === "Cotizada" && <p>{l.baseTotalLinea}</p>}</td>
              <td>{mostrarDato(l.cantidadEmpaques)}</td><td>{mostrarDato(l.precioUnitario)}</td><td>{mostrarDato(l.totalLinea)}</td>
              <td>{l.estadoRevision}</td>
              {editable && <td>
                <button type="button" className="btn btn--secondary" disabled={operacion.ocupado}
                  onClick={() => { setEditarLinea(llave); setRevisarLinea(null); }}>Editar renglón {numero}</button>{" "}
                <button type="button" className="btn btn--secondary" disabled={operacion.ocupado || l.estadoRevision === "Revisada"}
                  onClick={() => { setRevisarLinea(llave); setEditarLinea(null); }}>Revisar renglón {numero}</button>
              </td>}
            </tr>;
          })}</tbody>
        </table>
      </div>
      {editable && <button type="button" className="btn btn--secondary" disabled={operacion.ocupado || lineas.length >= 200}
        onClick={() => { setEditarLinea("nueva"); setRevisarLinea(null); }}>Agregar renglón de respuesta</button>}
      {editable && editarLinea !== null && <EditorLineaRespuesta key={editarLinea} linea={lineaActual} solicitud={solicitud}
        ocupado={operacion.ocupado} cerrar={() => setEditarLinea(null)}
        guardar={(cuerpo) => aplicar(() => guardarLineaRespuesta(id, lineaActual?.idProformaProveedorDetalle, cuerpo()),
          "Renglón guardado. Confirma su revisión.", () => setEditarLinea(null))} />}
      {editable && revisarLinea !== null && <MotivoAccion key={revisarLinea} etiqueta="Motivo de revisión del renglón"
        boton="Confirmar revisión" ocupado={operacion.ocupado} cerrar={() => setRevisarLinea(null)}
        ejecutar={(motivo) => aplicar(() => confirmarLinea(id, revisarLinea, motivo), "Renglón revisado.", () => setRevisarLinea(null))} />}
    </Tarjeta>
    {editable && <Conciliacion resumen={respuesta} ocupado={operacion.ocupado}
      guardar={(cuerpo, cerrar) => aplicar(() => conciliarRespuesta(id, cuerpo()), "Conciliación registrada.", cerrar)} />}
    <Mensajes {...operacion} />
  </>;
}
