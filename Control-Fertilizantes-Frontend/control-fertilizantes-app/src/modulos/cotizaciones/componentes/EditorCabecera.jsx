import { useState } from "react";
import Campo from "../../../componentes/comunes/Campo.jsx";
import { camposCabecera, camposParte, cuerpoCabecera, partesCabecera, valoresCabecera } from "../utils/formularioRespuesta.js";

export default function EditorCabecera({ cabecera, guardar, cerrar, ocupado }) {
  const [valores, setValores] = useState(() => valoresCabecera(cabecera));
  const [motivo, setMotivo] = useState("");
  const asignar = (campo) => (valor) => setValores((actual) => ({ ...actual, [campo]: valor }));

  return <form className="form" onSubmit={(e) => {
    e.preventDefault();
    guardar(() => ({ motivo: motivo.trim(), cabecera: cuerpoCabecera(valores) }));
  }}>
    <fieldset className="form-row" disabled={ocupado}>
      {camposCabecera.map(([campo, etiqueta, maxLength, tipo]) => <Campo key={campo} etiqueta={etiqueta}
        valor={valores[campo]} cambiar={asignar(campo)} maxLength={maxLength}
        textoLargo={tipo === "largo"} type={tipo === "date" || tipo === "tel" ? tipo : "text"}
        formatoNumerico={tipo === "decimal" || tipo === "entero" ? tipo : undefined} />)}
    </fieldset>
    {partesCabecera.map(([parte, titulo]) => <fieldset key={parte} className="form-row" disabled={ocupado}>
      <legend>{titulo}</legend>
      {camposParte.map(([campo, etiqueta, maxLength, tipo]) => <Campo key={campo} etiqueta={`${titulo}: ${etiqueta}`}
        valor={valores[parte][campo]} maxLength={maxLength} type={tipo}
        cambiar={(valor) => asignar(parte)({ ...valores[parte], [campo]: valor })} />)}
    </fieldset>)}
    <Campo etiqueta="Motivo del ajuste de cabecera" valor={motivo} cambiar={setMotivo} maxLength={1000} required disabled={ocupado} />
    <div className="form-actions">
      <button type="button" className="btn btn--secondary" onClick={cerrar} disabled={ocupado}>Cancelar edición</button>
      <button className="btn btn--primary" disabled={ocupado}>Guardar cabecera</button>
    </div>
  </form>;
}
