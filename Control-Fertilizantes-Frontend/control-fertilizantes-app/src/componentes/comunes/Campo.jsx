import { useId } from "react";
import EntradaNumerica from "./EntradaNumerica.jsx";

export default function Campo({ etiqueta, valor, cambiar, opciones, textoLargo = false, casilla = false, formatoNumerico, ...atributos }) {
  const id = useId();
  const formato = formatoNumerico ?? (atributos.type === "tel" ? "telefono" : undefined);
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{etiqueta}</label>
      {casilla ? (
        <input {...atributos} id={id} type="checkbox" checked={Boolean(valor)} onChange={(e) => cambiar(e.target.checked)} />
      ) : opciones ? (
        <select {...atributos} className="select" id={id} value={valor ?? ""} onChange={(e) => cambiar(e.target.value)}>
          <option value="">Seleccione…</option>
          {opciones.map(({ value, label, disabled }) => <option key={value} value={value} disabled={disabled}>{label}</option>)}
        </select>
      ) : textoLargo ? (
        <textarea {...atributos} className="textarea" id={id} value={valor ?? ""} onChange={(e) => cambiar(e.target.value)} />
      ) : formato ? (
        <EntradaNumerica {...atributos} formato={formato} className="input" id={id} value={valor ?? ""} onChange={(e) => cambiar(e.target.value)} />
      ) : (
        <input {...atributos} className="input" id={id} value={valor ?? ""} onChange={(e) => cambiar(e.target.value)} />
      )}
    </div>
  );
}
