import { useMemo, useState } from "react";
import FiltrosCompras from "./FiltroCompras";
import TablaCompras from "./TablaCompras";
import EstadoLista from "../../EstadoLista";
import useCompras from "../../hooks/useCompras";
import usePaginacion from "../../hooks/usePaginacion";
import {
  filtrarCompras,
  obtenerMonedasDisponibles,
  obtenerTendenciasDisponibles,
  obtenerTextoResumen
} from "../../utils/compras";

function ListaCompras({ recargar, onEditar, onAgregar }) {
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [busquedaProveedor, setBusquedaProveedor] = useState("");
  const [filtroMoneda, setFiltroMoneda] = useState("todas");
  const [filtroTendencia, setFiltroTendencia] = useState("todas");
  const [filtroFecha, setFiltroFecha] = useState("");

  const comprasPorPagina = 5;

  const {
    compras,
    cargando,
    error
  } = useCompras(recargar);

  const monedasDisponibles = useMemo(() => {
    return obtenerMonedasDisponibles(compras);
  }, [compras]);

  const tendenciasDisponibles = useMemo(() => {
    return obtenerTendenciasDisponibles(compras);
  }, [compras]);

  const comprasFiltradas = useMemo(() => {
    return filtrarCompras(
      compras,
      busquedaProducto,
      busquedaProveedor,
      filtroMoneda,
      filtroTendencia,
      filtroFecha
    );
  }, [
    compras,
    busquedaProducto,
    busquedaProveedor,
    filtroMoneda,
    filtroTendencia,
    filtroFecha
  ]);

  const {
    paginaActual,
    totalPaginas,
    indiceInicial,
    indiceFinal,
    itemsPaginados: comprasPaginadas,
    irAPagina,
    irAnterior,
    irSiguiente,
    paginasVisibles
  } = usePaginacion(comprasFiltradas, comprasPorPagina, [
    busquedaProducto,
    busquedaProveedor,
    filtroMoneda,
    filtroTendencia,
    filtroFecha
  ]);

  const limpiarFiltros = () => {
    setBusquedaProducto("");
    setBusquedaProveedor("");
    setFiltroMoneda("todas");
    setFiltroTendencia("todas");
    setFiltroFecha("");
  };

  return (
  <section className="page-section">

    {/* HEADER */}
    <div className="page-section__header">
      <div>
        <h2 className="page-section__title">Lista de compras</h2>
        <p className="page-section__subtitle">
          Consulta, filtra y administra las compras registradas en el sistema.
        </p>
      </div>

      {onAgregar && (
        <button
          className="btn btn--primary btn--md"
          onClick={onAgregar}
          type="button"
        >
          Registrar compra
        </button>
      )}
    </div>

    {/* CONTENIDO */}
    {cargando ? (
      <EstadoLista tipo="cargando" mensaje="Cargando compras..." />
    ) : error ? (
      <EstadoLista tipo="error" mensaje={error} />
    ) : compras.length === 0 ? (
      <EstadoLista
        tipo="vacio"
        mensaje="No hay compras registradas"
        subtitulo="Cuando registres compras, aparecerán aquí para analizarlas."
      />
    ) : comprasFiltradas.length === 0 ? (
      <EstadoLista
        tipo="vacio"
        mensaje="No se encontraron resultados"
        subtitulo="Prueba con otra búsqueda o cambia los filtros."
      />
    ) : (
      <>
        {/* FILTROS */}
        <FiltrosCompras
          busquedaProducto={busquedaProducto}
          setBusquedaProducto={setBusquedaProducto}
          busquedaProveedor={busquedaProveedor}
          setBusquedaProveedor={setBusquedaProveedor}
          filtroMoneda={filtroMoneda}
          setFiltroMoneda={setFiltroMoneda}
          filtroTendencia={filtroTendencia}
          setFiltroTendencia={setFiltroTendencia}
          filtroFecha={filtroFecha}
          setFiltroFecha={setFiltroFecha}
          monedasDisponibles={monedasDisponibles}
          tendenciasDisponibles={tendenciasDisponibles}
          onLimpiarFiltros={limpiarFiltros}
        />

        {/* RESUMEN */}
        <div className="table__cell-muted" style={{ padding: "0 0 var(--space-3) 0" }}>
          {comprasFiltradas.length > 0
            ? `Mostrando ${indiceInicial + 1}-${Math.min(indiceFinal, comprasFiltradas.length)} de ${comprasFiltradas.length}`
            : obtenerTextoResumen(compras.length, comprasFiltradas.length)}
        </div>

        {/* TABLA */}
        <TablaCompras
          compras={comprasPaginadas}
          onEditar={onEditar}
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
              {paginasVisibles.map((numeroPagina) => (
                <button
                  key={numeroPagina}
                  type="button"
                  className={
                    paginaActual === numeroPagina
                      ? "btn btn--primary"
                      : "btn btn--ghost"
                  }
                  onClick={() => irAPagina(numeroPagina)}
                  aria-current={paginaActual === numeroPagina ? "page" : undefined}
                >
                  {numeroPagina}
                </button>
              ))}
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

export default ListaCompras;
