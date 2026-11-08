import { fechaHora } from "../../../utils/datosApi.js";
import { Tarjeta } from "../../../componentes/comunes/Pagina.jsx";
import { etiquetaCotizacion } from "../utils/etiquetasCotizacion.js";

export default function EvidenciaRespuesta({ datos }) {
  const { documento, importacion, historial } = datos;
  const advertencias = Array.isArray(importacion?.advertencias) ? importacion.advertencias : [];

  return <Tarjeta titulo="Extracción e historial">
    {!documento && <p>Esta respuesta no tiene un PDF registrado.</p>}
    {importacion && <div>
      <p>{importacion.metodo === "AcroForm" ? "Formulario reconocido" : "Captura manual"} · {etiquetaCotizacion(importacion.estado)}</p>
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
