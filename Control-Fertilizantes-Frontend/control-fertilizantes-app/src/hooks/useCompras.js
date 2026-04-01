import { useCallback, useEffect, useState } from "react";
import { obtenerCompras } from "../api/compraApi";

function useCompras(recargar) {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarCompras = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const data = await obtenerCompras();
      setCompras(data);
    } catch (err) {
      setError("No se pudieron cargar las compras.");
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarCompras();
  }, [cargarCompras, recargar]);

  return {
    compras,
    cargando,
    error,
    cargarCompras
  };
}

export default useCompras;