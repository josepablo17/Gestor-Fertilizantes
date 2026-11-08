import { useState } from "react";
import Campo from "../../../componentes/comunes/Campo.jsx";
import { Mensajes, Tarjeta } from "../../../componentes/comunes/Pagina.jsx";
import { numeroEditable } from "../../../utils/numeros.js";
import { monedaVisible, motivoValido } from "../utils/presupuesto.js";
import { vistaPreviaMonto } from "../utils/edicionPresupuesto.js";

export default function FormularioMontoPartida({ accion, aplicar, cancelar, ocupado }) {
  const [monto, setMonto] = useState(() => numeroEditable(accion.partida.aprobado));
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  let previa, errorImporte;
  try { previa = vistaPreviaMonto(accion.partida, monto); } catch (fallo) { errorImporte = fallo.message; }
  const moneda = (valor) => monedaVisible(valor, accion.moneda);

  return <Tarjeta titulo={`Cambiar monto · ${accion.partida.rubro}`}>
    <form className="form" onSubmit={(e) => {
      e.preventDefault(); setError("");
      try {
        if (!previa?.puedeGuardar) throw new Error(errorImporte || previa?.mensaje || "Revisa el nuevo monto.");
        aplicar({ nuevoMonto: previa.nuevoMonto, montoAprobadoEsperado: previa.montoAprobadoEsperado, motivo: motivoValido(motivo) });
      } catch (fallo) { setError(fallo.message); }
    }}>
      <p>Indica el total que debe quedar aprobado para este rubro. El sistema calculará la diferencia.</p>
      <div className="form-row">
        <Campo etiqueta="Nuevo monto aprobado" valor={monto} cambiar={setMonto} formatoNumerico="decimal" required disabled={ocupado} />
        <Campo etiqueta="Motivo del ajuste" valor={motivo} cambiar={setMotivo} maxLength={500} textoLargo required disabled={ocupado} />
      </div>
      <section aria-label="Vista previa del ajuste" aria-live="polite">
        <p>Aprobado actual: {moneda(accion.partida.aprobado)}</p>
        <p>Reservado: {moneda(accion.partida.comprometido)} · Gastado: {moneda(accion.partida.ejecutado)}</p>
        {previa && <>
          <p>{previa.mensaje || `${previa.direccion}: ${moneda(previa.magnitud)}`}</p>
          <p>Disponible después del cambio: <strong>{moneda(previa.disponible)}</strong></p>
          {previa.mantieneExceso && previa.puedeGuardar && <p>El aumento reduce el exceso, pero todavía queda gasto o reserva por cubrir.</p>}
        </>}
      </section>
      <Mensajes error={error || errorImporte} />
      <div className="form-actions">
        <button type="button" className="btn btn--secondary" disabled={ocupado} onClick={cancelar}>Volver</button>
        <button className="btn btn--primary" disabled={ocupado || !previa?.puedeGuardar || !motivo.trim()}>Confirmar</button>
      </div>
    </form>
  </Tarjeta>;
}
