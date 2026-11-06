import { Link } from "react-router-dom";

export default function AccionesRegistro({ rutaEdicion, onCambiarEstado, accionEstado = "Desactivar", ocupado = false }) {
  return (
    <div className="table__actions">
      <Link className="btn btn--secondary btn--sm" to={rutaEdicion}>Editar</Link>
      {onCambiarEstado && (
        <button type="button" className={accionEstado === "Desactivar" ? "btn btn--danger btn--sm" : "btn btn--secondary btn--sm"}
          disabled={ocupado} onClick={onCambiarEstado}>
          {accionEstado}
        </button>
      )}
    </div>
  );
}
