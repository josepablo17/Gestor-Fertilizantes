import { useMemo,useState } from "react";
import FiltroProveedores from "./FiltroProveedores";
import TablaProveedores from "./TablaProveedores";
import EstadoLista from "../../EstadoLista";
import useProveedores from "../../hooks/useProveedores";
import usePaginacion from "../../hooks/usePaginacion";
import {filtrarProveedores,obtenerTextoResumen} from "../../utils/proveedores";

function ListaProveedores({recargar, onEditar, onProveedorDesactivado, onAgregar}){
    const [busqueda,setBusqueda] =  useState("");
    const [filtroEstado,setFiltroEstado] = useState("todos")

    const proveedoresPorPagina = 5;

    const {
        proveedores,
        cargando,
        error,
        manejarDesactivar
    } = useProveedores(recargar,onProveedorDesactivado);

    const proveedoresFiltrados = useMemo(()=>{
        return filtrarProveedores(proveedores,busqueda,filtroEstado);
    },[proveedores,busqueda,filtroEstado]);

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
        <div className="seccion-modulo">
            <div className="cabecera-lista">
                <div className="titulo-seccion">
                    <h2>Lista de Proveedores</h2>
                    <p>Consulta, filtra, edita y administra los proveedores registrados.</p>
                </div>

                {onAgregar && (
                    <button
                        className="boton-base boton-agregar"
                        onClick={onAgregar}
                        type="button"
                    >
                        Agregar proveedor
                    </button>
                )}
            </div>

            {!cargando && !error && proveedores.length > 0 && (
                <>
                    <FiltroProveedores
                        busqueda={busqueda}
                        setBusqueda={setBusqueda}
                        filtroEstado={filtroEstado}
                        setFiltroEstado={setFiltroEstado}
                        onLimpiarFiltros={limpiarFiltros}
                    />

                    <div className="resumen-lista">
                        <span>
                            {proveedoresFiltrados.length > 0
                                ? `Mostrando ${indiceInicial + 1}-${Math.min(indiceFinal, proveedoresFiltrados.length)} de ${proveedoresFiltrados.length} proveedor${proveedoresFiltrados.length !== 1 ? "es" : ""}`
                                : obtenerTextoResumen(proveedores.length, proveedoresFiltrados.length)}
                        </span>
                    </div>
                </>
            )}

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
                    <TablaProveedores
                        proveedores={proveedoresPaginados}
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
export default ListaProveedores;