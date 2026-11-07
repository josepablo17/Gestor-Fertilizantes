import { useEffect, useMemo, useRef, useState } from "react";
import {
  insertarCompra,
  actualizarCompra
} from "../api/compraApi";
import { obtenerProductos } from "../api/productosApi";
import { obtenerProveedores } from "../api/proveedorApi";
import { obtenerPresentacionesProducto } from "../api/presentacionProductoApi";
import { mostrarError, mostrarExito } from "../utils/alertas";
import { decimalOpcional } from "../utils/datosApi.js";
import { numeroEditable } from "../utils/numeros.js";

const compraInicial = {
  idCompra: 0,
  idProducto: "",
  idProveedor: "",
  idPresentacionProducto: "",
  fechaCompra: "",
  cantidadComprada: "",
  precioTotal: "",
  moneda: "",
  observaciones: ""
};

function useFormularioCompra({
  compraEditar,
  onCompraGuardada,
  onCancelarEdicion
}) {
  const [compra, setCompra] = useState(compraInicial);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const bloqueoGuardado = useRef(false);

  const estaEditando = compraEditar !== null;

  useEffect(() => {
    cargarCatalogos();
  }, []);

  useEffect(() => {
    if (compraEditar) {
      setCompra({
        idCompra: compraEditar.idCompra || 0,
        idProducto: compraEditar.idProducto || "",
        idProveedor: compraEditar.idProveedor || "",
        idPresentacionProducto: compraEditar.idPresentacionProducto || "",
        fechaCompra: compraEditar.fechaCompra
          ? compraEditar.fechaCompra.split("T")[0]
          : "",
        cantidadComprada: numeroEditable(compraEditar.cantidadComprada),
        precioTotal: numeroEditable(compraEditar.precioTotal),
        moneda: compraEditar.moneda || "",
        observaciones: compraEditar.observaciones || ""
      });
    } else {
      setCompra(compraInicial);
    }
  }, [compraEditar]);

  const cargarCatalogos = async () => {
    try {
      setCargandoCatalogos(true);

      const [dataProductos, dataProveedores, dataPresentaciones] =
        await Promise.all([
          obtenerProductos(),
          obtenerProveedores(),
          obtenerPresentacionesProducto()
        ]);

      const productosActivos = Array.isArray(dataProductos)
        ? dataProductos.filter((item) => item.activo !== false)
        : [];

      const proveedoresActivos = Array.isArray(dataProveedores)
        ? dataProveedores.filter((item) => item.activo !== false)
        : [];

      const presentacionesActivas = Array.isArray(dataPresentaciones)
        ? dataPresentaciones.filter((item) => item.activo !== false)
        : [];

      setProductos(productosActivos);
      setProveedores(proveedoresActivos);
      setPresentaciones(presentacionesActivas);
    } catch (error) {
      console.error(error);
      await mostrarError(
        "Ocurrió un error",
        "No se pudieron cargar los catálogos del formulario."
      );
    } finally {
      setCargandoCatalogos(false);
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setCompra((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "idProducto" ? { idPresentacionProducto: "" } : {})
    }));
  };

  const validarFormulario = () => {
    if (!compra.idProducto) {
      mostrarError("Campo requerido", "Debes seleccionar un producto.");
      return false;
    }

    if (!compra.idProveedor) {
      mostrarError("Campo requerido", "Debes seleccionar un proveedor.");
      return false;
    }

    if (!compra.idPresentacionProducto) {
      mostrarError("Campo requerido", "Debes seleccionar una presentación.");
      return false;
    }

    if (!compra.fechaCompra) {
      mostrarError("Campo requerido", "Debes indicar la fecha de compra.");
      return false;
    }

    const cantidad = Number(compra.cantidadComprada);
    if (!/^[0-9]+$/.test(String(compra.cantidadComprada)) || !Number.isSafeInteger(cantidad) || cantidad <= 0) {
      mostrarError(
        "Campo inválido",
        "Indica un número entero de empaques mayor que cero."
      );
      return false;
    }

    try {
      if (!decimalOpcional(compra.precioTotal, 4, true)) throw new Error();
    } catch {
      mostrarError(
        "Campo inválido",
        "Indica un precio total mayor que cero, con hasta cuatro decimales."
      );
      return false;
    }

    if (!compra.moneda.trim()) {
      mostrarError("Campo requerido", "Debes indicar la moneda.");
      return false;
    }

    if (compra.observaciones && compra.observaciones.length > 500) {
      mostrarError(
        "Campo inválido",
        "Las observaciones no pueden superar los 500 caracteres."
      );
      return false;
    }

    return true;
  };

  const manejarSubmit = async (e, prepararPresupuesto) => {
    e.preventDefault();

    if (bloqueoGuardado.current || !validarFormulario()) return;

    const payload = {
      idCompra: estaEditando ? Number(compra.idCompra) : undefined,
      idProducto: Number(compra.idProducto),
      idProveedor: Number(compra.idProveedor),
      idPresentacionProducto: Number(compra.idPresentacionProducto),
      fechaCompra: compra.fechaCompra,
      cantidadComprada: Number(compra.cantidadComprada),
      precioTotal: decimalOpcional(compra.precioTotal, 4, true),
      moneda: compra.moneda.trim(),
      observaciones: compra.observaciones.trim()
    };

    bloqueoGuardado.current = true;
    setGuardando(true);
    try {
      if (estaEditando) {
        await actualizarCompra(payload);
        await mostrarExito(
          "Compra actualizada",
          "La compra se actualizó correctamente."
        );
      } else {
        delete payload.idCompra;
        if (prepararPresupuesto) payload.imputacionPresupuesto = prepararPresupuesto(payload);
        await insertarCompra(payload);
        await mostrarExito(
          "Compra guardada",
          "La compra se registró correctamente."
        );
      }

      setCompra(compraInicial);

      if (onCompraGuardada) {
        onCompraGuardada();
      }
    } catch (error) {
      await mostrarError(
        "Ocurrió un error",
        error.message || (estaEditando
          ? "No se pudo actualizar la compra."
          : "No se pudo registrar la compra.")
      );
      console.error(error);
    } finally {
      bloqueoGuardado.current = false;
      setGuardando(false);
    }
  };

  const manejarCancelar = () => {
    setCompra(compraInicial);

    if (onCancelarEdicion) {
      onCancelarEdicion();
    }
  };

  const presentacionesFiltradas = useMemo(() => {
    if (!compra.idProducto) {
      return presentaciones;
    }

    return presentaciones.filter(
      (item) => String(item.idProducto) === String(compra.idProducto)
    );
  }, [presentaciones, compra.idProducto]);

  return {
    compra,
    setCompra,
    productos,
    proveedores,
    presentaciones,
    presentacionesFiltradas,
    cargandoCatalogos,
    guardando,
    estaEditando,
    manejarCambio,
    manejarSubmit,
    manejarCancelar
  };
}

export default useFormularioCompra;
