import { useMemo, useState } from "react";
import useComparadorProveedor from "../hooks/useComparadorProveedor";
import useProductos from "../hooks/useProductos";
import usePresentacionesProducto from "../hooks/usePresentacionProductos";

import FiltrosComparadorProveedor from "../componentes/comparadorProveedor/FiltrosComparadorProveedor";
import ResumenComparadorProveedor from "../componentes/comparadorProveedor/ResumenComparadorProveedor";
import TablaComparadorProveedor from "../componentes/comparadorProveedor/TablaComparadorProveedor";
import ModalDetalleProveedor from "../componentes/comparadorProveedor/ModalDetalleProveedor";
import Loader from "../componentes/Loader";

import { mostrarError } from "../utils/alertas";

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
    <section className="page">
      {/* HEADER */}
      <header className="page__header">
        <div className="page__header-content">
          <h1 className="page__title">Comparador de proveedores</h1>
          <p className="page__subtitle">
            Analiza precios, estabilidad y comportamiento histórico para tomar mejores decisiones.
          </p>
        </div>

        <div className="page__actions">
          <button
            className="btn btn--primary btn--md"
            onClick={manejarComparar}
          >
            Comparar
          </button>
        </div>
      </header>

      <div className="page__body">
        {/* FILTROS */}
        <section className="card">
          <div className="card__body">
            <FiltrosComparadorProveedor
              productos={productos}
              presentaciones={presentacionesFiltradas}
              filtros={filtros}
              setFiltros={setFiltros}
              onComparar={manejarComparar}
              onLimpiar={manejarLimpiar}
            />
          </div>
        </section>

        {/* LOADER */}
        {cargando && <Loader />}

        {/* ERROR */}
        {(error || errorProductos || errorPresentaciones) && (
          <section className="card">
            <div className="card__body">
              <p className="text-danger">
                {error ||
                  errorProductos ||
                  errorPresentaciones ||
                  "Ocurrió un error al cargar la información."}
              </p>
            </div>
          </section>
        )}

        {/* RESUMEN */}
        {resumen && (
          <section className="card">
            <div className="card__body">
              <ResumenComparadorProveedor resumen={resumen} />
            </div>
          </section>
        )}

        {/* TABLA */}
        {proveedores.length > 0 && (
          <section className="card">
            <div className="card__body">
              <TablaComparadorProveedor
                proveedores={proveedores}
                onVerDetalle={manejarVerDetalle}
              />
            </div>
          </section>
        )}

        {/* EMPTY */}
        {!cargando && !error && !comparativa && (
          <section className="card">
            <div className="card__body">
              <div className="estado-vacio-modulo">
                <h3>Seleccione un producto</h3>
                <p>
                  Use los filtros para comparar proveedores y analizar precios.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* MODAL */}
      {modalDetalleAbierto && detalleProveedor && (
        <ModalDetalleProveedor
          detalleProveedor={detalleProveedor}
          onCerrar={cerrarModalDetalle}
        />
      )}
    </section>
  );
}

export default ComparadorProveedor;