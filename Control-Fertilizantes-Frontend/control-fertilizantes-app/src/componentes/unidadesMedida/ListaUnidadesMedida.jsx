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
        <section className="page-section">
            {/* HEADER */}
            <div className="page-section__header">
                <div>
                    <h2 className="page-section__title">Lista de unidades de medida</h2>
                    <p className="page-section__subtitle">
                        Consulta, edita y administra las unidades de medida registradas en el sistema.
                    </p>
                </div>

                {onAgregar && (
                    <button
                        className="btn btn--primary btn--md"
                        onClick={onAgregar}
                        type="button"
                    >
                        Agregar unidad de medida
                    </button>
                )}
            </div>

            {/* CONTENIDO */}
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
                <>
                    {/* RESUMEN */}
                    <div className="table__cell-muted" style={{ padding: "0 0 var(--space-3) 0" }}>
                        {obtenerTextoResumen(unidadesMedida.length)}
                    </div>

                    {/* TABLA */}
                    <TablaUnidadesMedida
                        unidadesMedida={unidadesMedida}
                        onEditar={onEditar}
                        onDesactivar={manejarDesactivar}
                    />
                </>
            )}
        </section>
    );
}

export default ListaUnidadesMedida;