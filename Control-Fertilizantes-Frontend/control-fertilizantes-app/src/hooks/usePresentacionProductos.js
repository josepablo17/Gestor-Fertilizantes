import { useCallback, useEffect, useState } from "react";
import {
  desactivarPresentacionProducto,
  obtenerPresentacionesProducto
} from "../api/presentacionProductoApi";
import {
  mostrarConfirmacion,
  mostrarError,
  mostrarExito
} from "../utils/alertas";

function usePresentacionesProducto(recargar, onPresentacionDesactivada) {
  const [presentacionesProducto, setPresentacionesProducto] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarPresentacionesProducto = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const data = await obtenerPresentacionesProducto();
      setPresentacionesProducto(data);
    } catch (err) {
      setError("No se pudieron cargar las presentaciones del producto.");
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPresentacionesProducto();
  }, [cargarPresentacionesProducto, recargar]);

  const manejarDesactivar = async (presentacionProducto) => {
    const resultado = await mostrarConfirmacion(
      "Desactivar presentación",
      `¿Deseas desactivar la presentación "${presentacionProducto.descripcion}"?`
    );

    if (!resultado.isConfirmed) {
      return false;
    }

    try {
      await desactivarPresentacionProducto(presentacionProducto.idPresentacionProducto);

      await mostrarExito(
        "Presentación desactivada",
        "La presentación del producto fue desactivada correctamente."
      );

      await cargarPresentacionesProducto();

      if (onPresentacionDesactivada) {
        onPresentacionDesactivada();
      }

      return true;
    } catch (err) {
      await mostrarError(
        "Ocurrió un error",
        "No se pudo desactivar la presentación del producto."
      );
      console.error(err);
      return false;
    }
  };

  return {
    presentacionesProducto,
    cargando,
    error,
    cargarPresentacionesProducto,
    manejarDesactivar
  };
}

export default usePresentacionesProducto;