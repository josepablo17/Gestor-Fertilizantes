import { useState } from "react";
import Campo from "../comunes/Campo.jsx";
import { Tarjeta } from "../comunes/Pagina.jsx";
import { decimalOpcional } from "../../utils/datosApi.js";

const estadosConciliacion = [
  { value: "Conciliada", label: "Conciliada" },
  { value: "ConDiferencias", label: "Con diferencias justificadas" },
];

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
  const [estado, setEstado] = useState("Conciliada");
  const [motivo, setMotivo] = useState("");
  const [tolerancia, setTolerancia] = useState("0.01");
  return <Tarjeta titulo="Conciliación de importes">
    <p>Estado: {resumen.estadoConciliacion}</p>
    {resumen.justificacionConciliacion && <p>{resumen.justificacionConciliacion}</p>}
    {!abierta ? <button type="button" className="btn btn--secondary" disabled={ocupado}
      onClick={() => setAbierta(true)}>Conciliar importes</button> : <form className="form" onSubmit={(e) => {
      e.preventDefault();
      guardar(() => ({ estadoConciliacion: estado, motivo: motivo.trim(), tolerancia: decimalOpcional(tolerancia, 4) }),
        () => setAbierta(false));
    }}>
      <fieldset className="form-row" disabled={ocupado}>
        <Campo etiqueta="Resultado de la conciliación" valor={estado} cambiar={setEstado} opciones={estadosConciliacion} required />
        <Campo etiqueta="Tolerancia (entre 0 y 1)" valor={tolerancia} cambiar={setTolerancia} inputMode="decimal" />
        <Campo etiqueta="Motivo de la conciliación" valor={motivo} cambiar={setMotivo} maxLength={1000} required />
      </fieldset>
      <div className="form-actions">
        <button type="button" className="btn btn--secondary" onClick={() => setAbierta(false)} disabled={ocupado}>Volver</button>
        <button className="btn btn--primary" disabled={ocupado || !motivo.trim()}>Guardar conciliación</button>
      </div>
    </form>}
  </Tarjeta>;
}
