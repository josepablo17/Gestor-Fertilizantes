import { useMemo, useState } from "react";
import FiltrosProductos from "./FiltroProductos";
import TablaProductos from "./TablaProductos";
import EstadoListaProductos from "./EstadoListaProductos";
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
    <div className="seccion-lista-productos">
      <div className="cabecera-lista-productos">
        <div className="titulo-seccion">
          <h2>Lista de Productos</h2>
          <p>Consulta, filtra, edita y administra los productos registrados.</p>
        </div>

        {onAgregar && (
          <button
            className="boton-agregar-producto"
            onClick={onAgregar}
            type="button"
          >
            Agregar producto
          </button>
        )}
      </div>

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

          <div className="resumen-productos">
            <span>
              {productosFiltrados.length > 0
                ? `Mostrando ${indiceInicial + 1}-${Math.min(indiceFinal, productosFiltrados.length)} de ${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? "s" : ""}`
                : obtenerTextoResumen(productos.length, productosFiltrados.length)}
            </span>
          </div>
        </>
      )}

      {cargando ? (
        <EstadoListaProductos tipo="cargando" mensaje="Cargando productos..." />
      ) : error ? (
        <EstadoListaProductos tipo="error" mensaje={error} />
      ) : productos.length === 0 ? (
        <EstadoListaProductos
          tipo="vacio"
          mensaje="No hay productos registrados"
          subtitulo="Cuando agregues productos, aparecerán aquí para administrarlos."
        />
      ) : productosFiltrados.length === 0 ? (
        <EstadoListaProductos
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

          {totalPaginas > 1 && (
            <div className="paginacion-productos">
              <button
                type="button"
                className="boton-paginacion"
                onClick={irAnterior}
                disabled={paginaActual === 1}
              >
                Anterior
              </button>

              <div className="numeros-paginacion">
                {Array.from({ length: totalPaginas }, (_, index) => {
                  const numeroPagina = index + 1;

                  return (
                    <button
                      key={numeroPagina}
                      type="button"
                      className={
                        paginaActual === numeroPagina
                          ? "boton-paginacion numero-pagina activa"
                          : "boton-paginacion numero-pagina"
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
                className="boton-paginacion"
                onClick={irSiguiente}
                disabled={paginaActual === totalPaginas}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ListaProductos;