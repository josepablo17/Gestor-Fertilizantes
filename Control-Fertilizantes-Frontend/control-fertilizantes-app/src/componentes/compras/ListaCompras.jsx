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
    <div className="seccion-modulo">
      <div className="cabecera-lista">
        <div className="titulo-seccion">
          <h2>Lista de Compras</h2>
          <p>
            Consulta, filtra y administra las compras registradas en el sistema.
          </p>
        </div>

        {onAgregar && (
          <button
            className="boton-base boton-agregar"
            onClick={onAgregar}
            type="button"
          >
            Registrar compra
          </button>
        )}
      </div>

      {!cargando && !error && compras.length > 0 && (
        <>
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

          <div className="resumen-lista">
            <span>
              {comprasFiltradas.length > 0
                ? `Mostrando ${indiceInicial + 1}-${Math.min(indiceFinal, comprasFiltradas.length)} de ${comprasFiltradas.length} compra${comprasFiltradas.length !== 1 ? "s" : ""}`
                : obtenerTextoResumen(compras.length, comprasFiltradas.length)}
            </span>
          </div>
        </>
      )}

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
          <TablaCompras
            compras={comprasPaginadas}
            onEditar={onEditar}
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
                        {paginasVisibles.map((item, index) => {
                          if (item === "...") {
                            return (
                              <span
                                key={`ellipsis-${index}`}
                                className="separador-paginacion"
                              >
                                ...
                              </span>
                            );
                          }

                          return (
                            <button
                              key={item}
                              type="button"
                              className={
                                paginaActual === item
                                  ? "boton-paginacion numero-pagina activa"
                                  : "boton-paginacion numero-pagina"
                              }
                              onClick={() => irAPagina(item)}
                            >
                              {item}
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

export default ListaCompras;