import { useState } from "react";
import {
  obtenerComparativaProveedores,
  obtenerDetalleProveedor
} from "../api/comparadorProveedorApi";

function useComparadorProveedor() {
  const [comparativa, setComparativa] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [detalleProveedor, setDetalleProveedor] = useState(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  const consultarComparativa = async (filtros) => {
    try {
      setCargando(true);
      setError(null);

      const data = await obtenerComparativaProveedores({
        idProducto: filtros.idProducto,
        idPresentacionProducto: filtros.idPresentacionProducto,
        moneda: filtros.moneda,
        mesesAnalisis: filtros.mesesAnalisis,
        soloAutorizados: filtros.soloAutorizados
      });

      setComparativa(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la comparativa de proveedores.");
      setComparativa(null);
    } finally {
      setCargando(false);
    }
  };

  const consultarDetalleProveedor = async (filtrosDetalle) => {
    try {
      setCargando(true);
      setError(null);

      const data = await obtenerDetalleProveedor({
        idProducto: filtrosDetalle.idProducto,
        idPresentacionProducto: filtrosDetalle.idPresentacionProducto,
        idProveedor: filtrosDetalle.idProveedor,
        moneda: filtrosDetalle.moneda,
        mesesAnalisis: filtrosDetalle.mesesAnalisis
      });

      setDetalleProveedor(data);
      setModalDetalleAbierto(true);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el detalle del proveedor.");
      setDetalleProveedor(null);
      setModalDetalleAbierto(false);
    } finally {
      setCargando(false);
    }
  };

  const cerrarModalDetalle = () => {
    setModalDetalleAbierto(false);
    setDetalleProveedor(null);
  };

  const limpiarComparativa = () => {
    setComparativa(null);
    setDetalleProveedor(null);
    setModalDetalleAbierto(false);
    setError(null);
  };

  return {
    comparativa,
    resumen: comparativa?.resumen ?? null,
    proveedores: comparativa?.proveedores ?? [],
    cargando,
    error,
    detalleProveedor,
    modalDetalleAbierto,
    consultarComparativa,
    consultarDetalleProveedor,
    cerrarModalDetalle,
    limpiarComparativa
  };
}

export default useComparadorProveedor;