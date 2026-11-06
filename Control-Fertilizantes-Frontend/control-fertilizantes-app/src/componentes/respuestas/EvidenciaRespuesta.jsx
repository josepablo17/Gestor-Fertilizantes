import { useEffect, useRef, useState } from "react";
import { descargarRespuestaPdf } from "../../api/cotizacionesApi.js";
import { descargarArchivo } from "../../api/cliente.js";
import useOperacion from "../../hooks/useOperacion.js";
import { fechaHora } from "../../utils/datosApi.js";
import { Mensajes, Tarjeta } from "../comunes/Pagina.jsx";

export default function EvidenciaRespuesta({ datos }) {
  const [archivo, setArchivo] = useState(null);
  const operacion = useOperacion();
  const { documento, importacion, historial } = datos;
  const id = datos.respuesta.idProformaProveedor;
  const advertencias = Array.isArray(importacion?.advertencias) ? importacion.advertencias : [];

  return <Tarjeta titulo="Evidencia original">
    {documento ? <>
      <p>{documento.nombre}</p>
      <div className="form-actions">
        <button type="button" className="btn btn--secondary" disabled={operacion.ocupado}
          onClick={() => archivo ? setArchivo(null) : operacion.ejecutar(async () => setArchivo(await descargarRespuestaPdf(id)))}>
          {archivo ? "Ocultar PDF original" : "Ver PDF original"}
        </button>
        <button type="button" className="btn btn--secondary" disabled={operacion.ocupado}
          onClick={() => operacion.ejecutar(async () => descargarArchivo(archivo ?? await descargarRespuestaPdf(id), documento.nombre))}>
          Descargar PDF original
        </button>
      </div>
      {archivo && <VisorPdf archivo={archivo} />}
    </> : <p>Esta respuesta no tiene un PDF registrado.</p>}
    <Mensajes {...operacion} />
    {importacion && <div>
      <p>{importacion.metodo === "AcroForm" ? "Formulario reconocido" : "Captura manual"} · {importacion.estado}</p>
      {advertencias.length > 0 && <ul>{advertencias.map((item, indice) =>
        <li key={indice}>{typeof item === "string" ? item : `${item?.mensaje ?? "Revisar el documento."}${item?.campo ? ` (${item.campo})` : ""}`}</li>
      )}</ul>}
      {importacion.advertencias && !Array.isArray(importacion.advertencias) && <details><summary>Advertencias originales</summary>
        <pre className="table-wrapper">{JSON.stringify(importacion.advertencias, null, 2)}</pre></details>}
      <details><summary>Valores de la extracción original</summary>
        <pre className="table-wrapper">{JSON.stringify(importacion.camposOriginales, null, 2)}</pre>
      </details>
    </div>}
    <details>
      <summary>Historial de cambios ({historial.length})</summary>
      {historial.length === 0 ? <p>No hay cambios registrados.</p> : <ul>{historial.map((cambio) => <li key={cambio.idCambioCotizacion}>
        <details><summary>{fechaHora(cambio.fechaCambio)} · {cambio.motivo || cambio.origen}</summary>
          <pre className="table-wrapper">{JSON.stringify(cambio.cambios, null, 2)}</pre>
        </details>
      </li>)}</ul>}
    </details>
  </Tarjeta>;
}

function VisorPdf({ archivo }) {
  const marco = useRef(null);
  useEffect(() => {
    const url = URL.createObjectURL(archivo);
    const iframe = marco.current;
    iframe.src = url;
    return () => {
      iframe.removeAttribute("src");
      URL.revokeObjectURL(url);
    };
  }, [archivo]);
  return <iframe ref={marco} title="PDF original de la proforma" width="100%" height="500" />;
}
