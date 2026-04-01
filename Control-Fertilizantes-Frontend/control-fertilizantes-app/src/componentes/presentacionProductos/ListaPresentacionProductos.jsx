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
    <div className="seccion-modulo">
      <div className="cabecera-lista">
        <div className="titulo-seccion">
          <h2>Lista de Presentaciones de Producto</h2>
          <p>Consulta, filtra, edita y administra las presentaciones registradas.</p>
        </div>

        {onAgregar && (
          <button
            className="boton-base boton-agregar"
            onClick={onAgregar}
            type="button"
          >
            Agregar presentación
          </button>
        )}
      </div>

      {!cargando && !error && presentacionesProducto.length > 0 && (
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

          <div className="resumen-lista">
            <span>
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
            </span>
          </div>
        </>
      )}

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
        <EstadoLista
          tipo="vacio"
          mensaje="No se encontraron resultados"
          subtitulo="Prueba con otra búsqueda o cambia los filtros seleccionados."
        />
      ) : (
        <>
          <TablaPresentacionesProducto
            presentacionesProducto={presentacionesPaginadas}
            onEditar={onEditar}
            onDesactivar={manejarDesactivar}
          />

          {totalPaginas > 1 && (
            <div className="paginacion">
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

export default ListaPresentacionProductos;