import { useRef } from "react";

export default function useIdOperacion() {
  const ultimo = useRef(null);

  function conOperacion(datos, contexto) {
    const clave = JSON.stringify([contexto, datos]);
    if (ultimo.current?.clave !== clave) ultimo.current = { clave, id: crypto.randomUUID() };
    return { ...datos, idOperacion: ultimo.current.id };
  }

  function completarOperacion() {
    ultimo.current = null;
  }

  return { conOperacion, completarOperacion };
}
