import EstadoLista from "../../EstadoLista";
import useUnidadesMedida from "../../hooks/useUnidadesMedida";
import { obtenerTextoResumen } from "../../utils/unidadesMedida";
import TablaUnidadesMedida from "./TablaUnidadesMedida";

function ListaUnidadesMedida({ recargar, onEditar, onUnidadMedidaDesactivada, onAgregar }) {
    const {
        unidadesMedida,
        cargando,
        error,
        manejarDesactivar
    } = useUnidadesMedida(recargar, onUnidadMedidaDesactivada);

    return (
        <div className="seccion-modulo">
            <div className="cabecera-lista">
                <div className="titulo-seccion">
                    <h2>Lista de Unidades de Medida</h2>
                    <p>Consulta, edita y administra las unidades de medida registradas en el sistema.</p>
                </div>

                {onAgregar && (
                    <button
                        className="boton-base boton-agregar"
                        onClick={onAgregar}
                        type="button"
                    >
                        Agregar unidad de medida
                    </button>
                )}
            </div>

            {!cargando && !error && unidadesMedida.length > 0 && (
                <div className="resumen-lista">
                    <span>{obtenerTextoResumen(unidadesMedida.length)}</span>
                </div>
            )}

            {cargando ? (
                <EstadoLista tipo="cargando" mensaje="Cargando unidades de medida..." />
            ) : error ? (
                <EstadoLista tipo="error" mensaje={error} />
            ) : unidadesMedida.length === 0 ? (
                <EstadoLista
                    tipo="vacio"
                    mensaje="No hay unidades de medida registradas"
                    subtitulo="Cuando agregues unidades de medida, aparecerán aquí para administrarlas."
                />
            ) : (
                <TablaUnidadesMedida
                    unidadesMedida={unidadesMedida}
                    onEditar={onEditar}
                    onDesactivar={manejarDesactivar}
                />
            )}
        </div>
    );
}

export default ListaUnidadesMedida;