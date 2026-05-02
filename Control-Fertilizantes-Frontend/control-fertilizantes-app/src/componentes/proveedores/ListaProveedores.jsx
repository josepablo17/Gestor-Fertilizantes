import { useMemo, useState } from "react";
import FiltroProveedores from "./FiltroProveedores";
import TablaProveedores from "./TablaProveedores";
import EstadoLista from "../../EstadoLista";
import useProveedores from "../../hooks/useProveedores";
import usePaginacion from "../../hooks/usePaginacion";
import { filtrarProveedores, obtenerTextoResumen } from "../../utils/proveedores";

function ListaProveedores({ recargar, onEditar, onProveedorDesactivado, onAgregar }) {
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos");

    const proveedoresPorPagina = 5;

    const {
        proveedores,
        cargando,
        error,
        manejarDesactivar
    } = useProveedores(recargar, onProveedorDesactivado);

    const proveedoresFiltrados = useMemo(() => {
        return filtrarProveedores(proveedores, busqueda, filtroEstado);
    }, [proveedores, busqueda, filtroEstado]);

    const {
        paginaActual,
        totalPaginas,
        indiceInicial,
        indiceFinal,
        itemsPaginados: proveedoresPaginados,
        irAPagina,
        irAnterior,
        irSiguiente
    } = usePaginacion(proveedoresFiltrados, proveedoresPorPagina, [
        busqueda,
        filtroEstado
    ]);

    const limpiarFiltros = () => {
        setBusqueda("");
        setFiltroEstado("todos");
    };

    return (
        <section className="page-section">

            {/* HEADER */}
            <div className="page-section__header">
                <div>
                    <h2 className="page-section__title">Lista de proveedores</h2>
                    <p className="page-section__subtitle">
                        Consulta, filtra, edita y administra los proveedores registrados.
                    </p>
                </div>

                {onAgregar && (
                    <button
                        type="button"
                        className="btn btn--primary btn--md"
                        onClick={onAgregar}
                    >
                        Agregar proveedor
                    </button>
                )}
            </div>

            {/* CONTENIDO */}
            {cargando ? (
                <EstadoLista tipo="cargando" mensaje="Cargando proveedores..." />
            ) : error ? (
                <EstadoLista tipo="error" mensaje={error} />
            ) : proveedores.length === 0 ? (
                <EstadoLista
                    tipo="vacio"
                    mensaje="No hay proveedores registrados"
                    subtitulo="Cuando agregues proveedores, aparecerán aquí para administrarlos."
                />
            ) : proveedoresFiltrados.length === 0 ? (
                <EstadoLista
                    tipo="vacio"
                    mensaje="No se encontraron resultados"
                    subtitulo="Prueba con otra búsqueda o cambia los filtros seleccionados."
                />
            ) : (
                <>
                    {/* FILTROS */}
                    <FiltroProveedores
                        busqueda={busqueda}
                        setBusqueda={setBusqueda}
                        filtroEstado={filtroEstado}
                        setFiltroEstado={setFiltroEstado}
                        onLimpiarFiltros={limpiarFiltros}
                    />

                    {/* RESUMEN */}
                    <div className="table__cell-muted" style={{ padding: "0 0 var(--space-3) 0" }}>
                        {proveedoresFiltrados.length > 0
                            ? `Mostrando ${indiceInicial + 1}-${Math.min(indiceFinal, proveedoresFiltrados.length)} de ${proveedoresFiltrados.length} proveedor${proveedoresFiltrados.length !== 1 ? "es" : ""}`
                            : obtenerTextoResumen(proveedores.length, proveedoresFiltrados.length)}
                    </div>

                    {/* TABLA */}
                    <TablaProveedores
                        proveedores={proveedoresPaginados}
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

export default ListaProveedores;