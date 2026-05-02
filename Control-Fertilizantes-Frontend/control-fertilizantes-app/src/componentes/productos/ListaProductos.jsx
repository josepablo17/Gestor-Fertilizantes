import { useMemo, useState } from "react";
import FiltrosProductos from "./FiltroProductos";
import TablaProductos from "./TablaProductos";
import EstadoLista from "../../EstadoLista";
import useProductos from "../../hooks/useProductos";
import usePaginacion from "../../hooks/usePaginacion";
import {
  filtrarProductos,
  obtenerCategoriasDisponibles,
  obtenerTextoResumen
} from "../../utils/productos";

function ListaProductos({ recargar, onEditar, onProductoDesactivado, onAgregar }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");

  const productosPorPagina = 5;

  const {
    productos,
    cargando,
    error,
    manejarDesactivar
  } = useProductos(recargar, onProductoDesactivado);

  const categoriasDisponibles = useMemo(() => {
    return obtenerCategoriasDisponibles(productos);
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    return filtrarProductos(productos, busqueda, filtroEstado, filtroCategoria);
  }, [productos, busqueda, filtroEstado, filtroCategoria]);

  const {
    paginaActual,
    totalPaginas,
    indiceInicial,
    indiceFinal,
    itemsPaginados: productosPaginados,
    irAPagina,
    irAnterior,
    irSiguiente
  } = usePaginacion(productosFiltrados, productosPorPagina, [
    busqueda,
    filtroEstado,
    filtroCategoria
  ]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("todos");
    setFiltroCategoria("todas");
  };

  return (
    <section className="page-section">
      
      {/* HEADER */}
      <div className="page-section__header">
        <div>
          <h2 className="page-section__title">Lista de productos</h2>
          <p className="page-section__subtitle">
            Consulta, filtra, edita y administra los productos registrados.
          </p>
        </div>

        {onAgregar && (
          <button
            className="btn btn--primary"
            onClick={onAgregar}
            type="button"
          >
            Agregar producto
          </button>
        )}
      </div>

      {/* FILTROS + RESUMEN */}
      {!cargando && !error && productos.length > 0 && (
        <>
          <FiltrosProductos
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            filtroCategoria={filtroCategoria}
            setFiltroCategoria={setFiltroCategoria}
            categoriasDisponibles={categoriasDisponibles}
            onLimpiarFiltros={limpiarFiltros}
          />

          <span className="text-muted">
            {productosFiltrados.length > 0
              ? `Mostrando ${indiceInicial + 1}-${Math.min(indiceFinal, productosFiltrados.length)} de ${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? "s" : ""}`
              : obtenerTextoResumen(productos.length, productosFiltrados.length)}
          </span>
        </>
      )}

      {/* ESTADOS */}
      {cargando ? (
        <EstadoLista tipo="cargando" mensaje="Cargando productos..." />
      ) : error ? (
        <EstadoLista tipo="error" mensaje={error} />
      ) : productos.length === 0 ? (
        <EstadoLista
          tipo="vacio"
          mensaje="No hay productos registrados"
          subtitulo="Cuando agregues productos, aparecerán aquí para administrarlos."
        />
      ) : productosFiltrados.length === 0 ? (
        <EstadoLista
          tipo="vacio"
          mensaje="No se encontraron resultados"
          subtitulo="Prueba con otra búsqueda o cambia los filtros seleccionados."
        />
      ) : (
        <>
          <TablaProductos
            productos={productosPaginados}
            onEditar={onEditar}
            onDesactivar={manejarDesactivar}
          />

          {/* PAGINACIÓN */}
          {totalPaginas > 1 && (
            <div className="toolbar">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={irAnterior}
                disabled={paginaActual === 1}
              >
                Anterior
              </button>

              <div className="toolbar__group">
                {Array.from({ length: totalPaginas }, (_, index) => {
                  const numeroPagina = index + 1;

                  return (
                    <button
                      key={numeroPagina}
                      type="button"
                      className={
                        paginaActual === numeroPagina
                          ? "btn btn--primary"
                          : "btn btn--ghost"
                      }
                      onClick={() => irAPagina(numeroPagina)}
                    >
                      {numeroPagina}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="btn btn--ghost"
                onClick={irSiguiente}
                disabled={paginaActual === totalPaginas}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ListaProductos;