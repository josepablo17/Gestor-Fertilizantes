import { useRef, useState } from "react";

export default function useOperacion() {
  const bloqueo = useRef(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  async function ejecutar(operacion, mensaje = "") {
    if (bloqueo.current) return;
    bloqueo.current = true;
    setOcupado(true);
    setError("");
    setAviso("");
    try {
      await operacion();
      setAviso(mensaje);
    } catch (fallo) {
      setError(fallo.message || "No se pudo completar la operación.");
    } finally {
      bloqueo.current = false;
      setOcupado(false);
    }
  }

  return { ejecutar, ocupado, error, aviso };
}
