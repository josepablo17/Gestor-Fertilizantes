import { useMemo, useState } from "react";
import useComparadorProveedor from "../../hooks/useComparadorProveedor";
import useProductos from "../../hooks/useProductos";
import usePresentacionesProducto from "../../hooks/usePresentacionProductos";

import FiltrosComparadorProveedor from "../comparadorProveedor/FiltrosComparadorProveedor";
import ResumenComparadorProveedor from "../comparadorProveedor/ResumenComparadorProveedor";
import TablaComparadorProveedor from "../comparadorProveedor/TablaComparadorProveedor";
import ModalDetalleProveedor from "../comparadorProveedor/ModalDetalleProveedor";

import { mostrarError } from "../../utils/alertas";



function ComparadorProveedor() {
  const [filtros, setFiltros] = useState({
    idProducto: "",
    idPresentacionProducto: "",
    moneda: "",
    mesesAnalisis: 12,
    soloAutorizados: false
  });

  const {
    comparativa,
    resumen,
    proveedores,
    cargando: cargandoComparativa,
    error,
    detalleProveedor,
    modalDetalleAbierto,
    consultarComparativa,
    consultarDetalleProveedor,
    cerrarModalDetalle,
    limpiarComparativa
  } = useComparadorProveedor();

  const {
    productos,
    cargando: cargandoProductos,
    error: errorProductos
  } = useProductos();

  const {
    presentacionesProducto,
    cargando: cargandoPresentaciones,
    error: errorPresentaciones
  } = usePresentacionesProducto();

  const presentacionesFiltradas = useMemo(() => {
    if (!filtros.idProducto) return [];

    return presentacionesProducto.filter(
      (presentacion) =>
        String(presentacion.idProducto) === String(filtros.idProducto)
    );
  }, [presentacionesProducto, filtros.idProducto]);

  const cargando =
    cargandoComparativa || cargandoProductos || cargandoPresentaciones;

  const manejarComparar = async () => {
    if (!filtros.idProducto) {
      await mostrarError(
        "Filtro requerido",
        "Debes seleccionar un producto para realizar la comparación."
      );
      return;
    }

    if (!filtros.idPresentacionProducto) {
      await mostrarError(
        "Filtro requerido",
        "Debes seleccionar una presentación del producto."
      );
      return;
    }

    await consultarComparativa(filtros);
  };

  const manejarLimpiar = () => {
    setFiltros({
      idProducto: "",
      idPresentacionProducto: "",
      moneda: "",
      mesesAnalisis: 12,
      soloAutorizados: false
    });

    limpiarComparativa();
  };

  const manejarVerDetalle = async (idProveedor) => {
    await consultarDetalleProveedor({
      idProducto: filtros.idProducto,
      idPresentacionProducto: filtros.idPresentacionProducto,
      idProveedor,
      moneda: filtros.moneda,
      mesesAnalisis: filtros.mesesAnalisis
    });
  };

  return (
    <div className="pagina-comparador-proveedor">
      <div className="contenedor-comparador-proveedor">
        {cargando }

        <div className="encabezado-comparador">
          <div className="encabezado-comparador__texto">
            <h1>Comparador Inteligente de Proveedores</h1>
            <p>
              Compare precios, estabilidad y comportamiento histórico para
              tomar mejores decisiones de compra en FertiControl.
            </p>
          </div>
        </div>

        <FiltrosComparadorProveedor
          productos={productos}
          presentaciones={presentacionesFiltradas}
          filtros={filtros}
          setFiltros={setFiltros}
          onComparar={manejarComparar}
          onLimpiar={manejarLimpiar}
        />

        {(error || errorProductos || errorPresentaciones) && (
          <div className="mensaje-error-comparador">
            <p>
              {error ||
                errorProductos ||
                errorPresentaciones ||
                "Ocurrió un error al cargar la información."}
            </p>
          </div>
        )}

        {resumen && <ResumenComparadorProveedor resumen={resumen} />}

        {proveedores.length > 0 && (
          <TablaComparadorProveedor
            proveedores={proveedores}
            onVerDetalle={manejarVerDetalle}
          />
        )}

        {modalDetalleAbierto && detalleProveedor && (
          <ModalDetalleProveedor
            detalleProveedor={detalleProveedor}
            onCerrar={cerrarModalDetalle}
          />
        )}

        {!cargando && !error && !comparativa && (
          <div className="estado-vacio-comparador">
            <h3>Seleccione un producto para iniciar la comparación</h3>
            <p>
              Use los filtros para analizar proveedores, comparar precios y ver
              la recomendación automática del sistema.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComparadorProveedor;