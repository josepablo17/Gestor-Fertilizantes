import { useCallback, useEffect, useState } from "react";
import { desactivarProducto, obtenerProductos } from "../api/productosApi";
import { mostrarConfirmacion, mostrarError, mostrarExito } from "../utils/alertas";

function useProductos(recargar, onProductoDesactivado) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarProductos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const data = await obtenerProductos();
      setProductos(data);
    } catch (err) {
      setError("No se pudieron cargar los productos.");
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos, recargar]);

  const manejarDesactivar = async (producto) => {
    const resultado = await mostrarConfirmacion(
      "Desactivar producto",
      `¿Deseas desactivar el producto "${producto.nombre}"?`
    );

    if (!resultado.isConfirmed) {
      return false;
    }

    try {
      await desactivarProducto(producto.idProducto);

      await mostrarExito(
        "Producto desactivado",
        "El producto fue desactivado correctamente."
      );

      await cargarProductos();

      if (onProductoDesactivado) {
        onProductoDesactivado();
      }

      return true;
    } catch (err) {
      await mostrarError(
        "Ocurrió un error",
        "No se pudo desactivar el producto."
      );
      console.error(err);
      return false;
    }
  };

  return {
    productos,
    cargando,
    error,
    cargarProductos,
    manejarDesactivar
  };
}

export default useProductos;