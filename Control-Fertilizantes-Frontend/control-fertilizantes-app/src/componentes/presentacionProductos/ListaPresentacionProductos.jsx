import { useMemo, useState } from "react";
import FiltrosPresentacionesProducto from "./FiltroPresentacionProducto";
import TablaPresentacionesProducto from "./TablaPresentacionProductos";
import EstadoLista from "../../EstadoLista";
import usePresentacionesProducto from "../../hooks/usePresentacionProductos";
import usePaginacion from "../../hooks/usePaginacion";
import {
  filtrarPresentacionesProducto,
  obtenerProductosDisponibles,
  obtenerUnidadesMedidaDisponibles,
  obtenerTextoResumen
} from "../../utils/presentacionProductos";

function ListaPresentacionProductos({
  recargar,
  onEditar,
  onPresentacionDesactivada,
  onAgregar
}) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroProducto, setFiltroProducto] = useState("todos");
  const [filtroUnidadMedida, setFiltroUnidadMedida] = useState("todas");

  const presentacionesPorPagina = 5;

  const {
    presentacionesProducto,
    cargando,
    error,
    manejarDesactivar
  } = usePresentacionesProducto(recargar, onPresentacionDesactivada);

  const productosDisponibles = useMemo(() => {
    return obtenerProductosDisponibles(presentacionesProducto);
  }, [presentacionesProducto]);

  const unidadesMedidaDisponibles = useMemo(() => {
    return obtenerUnidadesMedidaDisponibles(presentacionesProducto);
  }, [presentacionesProducto]);

  const presentacionesFiltradas = useMemo(() => {
    return filtrarPresentacionesProducto(
      presentacionesProducto,
      busqueda,
      filtroEstado,
      filtroProducto,
      filtroUnidadMedida
    );
  }, [
    presentacionesProducto,
    busqueda,
    filtroEstado,
    filtroProducto,
    filtroUnidadMedida
  ]);

  const {
    paginaActual,
    totalPaginas,
    indiceInicial,
    indiceFinal,
    itemsPaginados: presentacionesPaginadas,
    irAPagina,
    irAnterior,
    irSiguiente
  } = usePaginacion(presentacionesFiltradas, presentacionesPorPagina, [
    busqueda,
    filtroEstado,
    filtroProducto,
    filtroUnidadMedida
  ]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("todos");
    setFiltroProducto("todos");
    setFiltroUnidadMedida("todas");
  };

  return (
    <section className="page-section">
      <div className="page-section__header">
        <div>
          <h2 className="page-section__title">Lista de presentaciones de producto</h2>
          <p className="page-section__subtitle">
            Consulta, filtra, edita y administra las presentaciones registradas.
          </p>
        </div>

        {onAgregar && (
          <button
            type="button"
            className="btn btn--primary btn--md"
            onClick={onAgregar}
          >
            Agregar presentación
          </button>
        )}
      </div>

      {cargando ? (
        <EstadoLista tipo="cargando" mensaje="Cargando presentaciones de producto..." />
      ) : error ? (
        <EstadoLista tipo="error" mensaje={error} />
      ) : presentacionesProducto.length === 0 ? (
        <EstadoLista
          tipo="vacio"
          mensaje="No hay presentaciones de producto registradas"
          subtitulo="Cuando agregues presentaciones, aparecerán aquí para administrarlas."
        />
      ) : presentacionesFiltradas.length === 0 ? (
        <>
          <FiltrosPresentacionesProducto
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            filtroProducto={filtroProducto}
            setFiltroProducto={setFiltroProducto}
            filtroUnidadMedida={filtroUnidadMedida}
            setFiltroUnidadMedida={setFiltroUnidadMedida}
            productosDisponibles={productosDisponibles}
            unidadesMedidaDisponibles={unidadesMedidaDisponibles}
            onLimpiarFiltros={limpiarFiltros}
          />

          <EstadoLista
            tipo="vacio"
            mensaje="No se encontraron resultados"
            subtitulo="Prueba con otra búsqueda o cambia los filtros seleccionados."
          />
        </>
      ) : (
        <>
          <FiltrosPresentacionesProducto
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            filtroProducto={filtroProducto}
            setFiltroProducto={setFiltroProducto}
            filtroUnidadMedida={filtroUnidadMedida}
            setFiltroUnidadMedida={setFiltroUnidadMedida}
            productosDisponibles={productosDisponibles}
            unidadesMedidaDisponibles={unidadesMedidaDisponibles}
            onLimpiarFiltros={limpiarFiltros}
          />

          <div className="table__cell-muted" style={{ padding: "0 0 var(--space-3) 0" }}>
            {presentacionesFiltradas.length > 0
              ? `Mostrando ${indiceInicial + 1}-${Math.min(
                  indiceFinal,
                  presentacionesFiltradas.length
                )} de ${presentacionesFiltradas.length} presentacion${
                  presentacionesFiltradas.length !== 1 ? "es" : ""
                }`
              : obtenerTextoResumen(
                  presentacionesProducto.length,
                  presentacionesFiltradas.length
                )}
          </div>

          <TablaPresentacionesProducto
            presentacionesProducto={presentacionesPaginadas}
            onEditar={onEditar}
            onDesactivar={manejarDesactivar}
          />

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

export default ListaPresentacionProductos;