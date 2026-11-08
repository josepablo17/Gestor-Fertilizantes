import { useState } from "react";
import Campo from "../../../componentes/comunes/Campo.jsx";
import { Tarjeta } from "../../../componentes/comunes/Pagina.jsx";
import { etiquetaConciliacion } from "../utils/etiquetasCotizacion.js";


export function MotivoAccion({ etiqueta, boton, ejecutar, cerrar, ocupado }) {
  const [motivo, setMotivo] = useState("");
  return <form className="form" onSubmit={(e) => { e.preventDefault(); if (motivo.trim()) ejecutar(motivo.trim()); }}>
    <Campo etiqueta={etiqueta} valor={motivo} cambiar={setMotivo} required maxLength={1000} disabled={ocupado} />
    <div className="form-actions">
      <button type="button" className="btn btn--secondary" onClick={cerrar} disabled={ocupado}>Volver</button>
      <button className="btn btn--primary" disabled={ocupado || !motivo.trim()}>{boton}</button>
    </div>
  </form>;
}

export function Conciliacion({ resumen, guardar, ocupado }) {
  const [abierta, setAbierta] = useState(false);
  const [motivo, setMotivo] = useState("");

  return <Tarjeta titulo="Conciliación de importes">
    <p role="status">{etiquetaConciliacion(resumen.estadoConciliacion)}</p>
    {resumen.justificacionConciliacion && <p>{resumen.justificacionConciliacion}</p>}
    <div className="form-actions">
      <button type="button" className="btn btn--primary" disabled={ocupado}
        onClick={() => guardar(() => ({ estadoConciliacion: "Conciliada" }))}>Comprobar importes</button>
      <button type="button" className="btn btn--secondary" disabled={ocupado} onClick={() => setAbierta(!abierta)}>
        {abierta ? "Ocultar justificación" : "Justificar diferencias"}
      </button>
    </div>
    {abierta && <form className="form" onSubmit={(evento) => {
      evento.preventDefault();
      guardar(() => ({ estadoConciliacion: "ConDiferencias", motivo: motivo.trim() }), () => setAbierta(false));
    }}>
      <p>Explica por qué aceptas la discrepancia entre los importes del documento.</p>
      <Campo etiqueta="Justificación de las diferencias" valor={motivo} cambiar={setMotivo} maxLength={1000} required disabled={ocupado} />
      <div className="form-actions">
        <button className="btn btn--primary" disabled={ocupado || !motivo.trim()}>Aceptar diferencias</button>
      </div>
    </form>}
  </Tarjeta>;
}
