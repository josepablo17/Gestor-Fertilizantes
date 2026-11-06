import { useState } from "react";
import { obtenerComparativaProveedores, obtenerDetalleProveedor } from "../api/comparadorProveedorApi.js";

export default function useComparadorProveedor() {
  const [comparativa, setComparativa] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [detalleProveedor, setDetalleProveedor] = useState(null);

  async function consultarComparativa(filtros) {
    setCargando(true);
    setError("");
    setDetalleProveedor(null);
    try {
      const datos = await obtenerComparativaProveedores(filtros);
      setComparativa({ datos, filtros });
    } catch (fallo) {
      setError(fallo.message || "No se pudo cargar la comparativa de proveedores.");
      setComparativa(null);
    } finally {
      setCargando(false);
    }
  }

  async function consultarDetalleProveedor(filtros) {
    setCargando(true);
    setError("");
    try {
      setDetalleProveedor(await obtenerDetalleProveedor(filtros));
    } catch (fallo) {
      setError(fallo.message || "No se pudo cargar el detalle del proveedor.");
      setDetalleProveedor(null);
    } finally {
      setCargando(false);
    }
  }

  function limpiarComparativa() {
    setComparativa(null);
    setDetalleProveedor(null);
    setError("");
  }

  return {
    filtrosAplicados: comparativa?.filtros,
    resumen: comparativa?.datos?.resumen,
    proveedores: comparativa?.datos?.proveedores ?? [],
    cargando,
    error,
    detalleProveedor,
    consultarComparativa,
    consultarDetalleProveedor,
    cerrarModalDetalle: () => setDetalleProveedor(null),
    limpiarComparativa
  };
}
