import {
    formatearEstado,
    formatearFactorConversion,
    formatearUnidadBase
} from "../../utils/unidadesMedida";

function TablaUnidadesMedida({ unidadesMedida, onEditar, onDesactivar }) {
    return (
        <div className="table-wrapper">
            <table className="table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Tipo base</th>
                        <th>Factor de conversión</th>
                        <th>¿Es unidad base?</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {unidadesMedida.map((unidadMedida) => (
                        <tr key={unidadMedida.idUnidadMedida}>
                            <td>
                                <span className="table__cell-strong">
                                    {unidadMedida.codigo || "Sin código"}
                                </span>
                            </td>

                            <td>
                                <span className="table__cell-muted">
                                    {unidadMedida.nombre || "Sin nombre"}
                                </span>
                            </td>

                            <td>
                                <span className="table__cell-muted">
                                    {unidadMedida.tipoBase || "Sin tipo base"}
                                </span>
                            </td>

                            <td>
                                <span className="table__cell-muted">
                                    {formatearFactorConversion(unidadMedida.factorConversion)}
                                </span>
                            </td>

                            <td>
                                <span
                                    className={
                                        unidadMedida.esUnidadBase
                                            ? "badge badge--success"
                                            : "badge badge--neutral"
                                    }
                                >
                                    {formatearUnidadBase(unidadMedida.esUnidadBase)}
                                </span>
                            </td>

                            <td>
                                <span
                                    className={
                                        unidadMedida.activo
                                            ? "badge badge--success"
                                            : "badge badge--neutral"
                                    }
                                >
                                    {formatearEstado(unidadMedida.activo)}
                                </span>
                            </td>

                            <td>
                                <div className="table__actions">
                                    <button
                                        className="btn btn--ghost btn--sm"
                                        onClick={() => onEditar(unidadMedida)}
                                        type="button"
                                    >
                                        Editar
                                    </button>

                                    {unidadMedida.activo && (
                                        <button
                                            className="btn btn--secondary btn--sm"
                                            onClick={() => onDesactivar(unidadMedida)}
                                            type="button"
                                        >
                                            Desactivar
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TablaUnidadesMedida;