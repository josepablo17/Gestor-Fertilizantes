import useOperacion from "./useOperacion.js";
import { mostrarConfirmacion } from "../utils/alertas.js";

export default function useDesactivarRegistro(desactivar, recargar) {
  const operacion = useOperacion();

  async function ejecutar(id, nombre) {
    const respuesta = await mostrarConfirmacion("Desactivar registro", `¿Deseas desactivar «${nombre}»?`);
    if (!respuesta.isConfirmed) return;
    await operacion.ejecutar(async () => {
      await desactivar(id);
      recargar();
    }, "Registro desactivado.");
  }

  return { ...operacion, desactivar: ejecutar };
}
