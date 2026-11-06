import AccionesRegistro from "../comunes/AccionesRegistro.jsx";

import {
    formatearEstado,
    formatearFactorConversion,
    formatearUnidadBase
} from "../../utils/unidadesMedida";

function TablaUnidadesMedida({ unidadesMedida, onDesactivar, ocupado }) {
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
                                <AccionesRegistro rutaEdicion={`/unidadesMedida/editar/${unidadMedida.idUnidadMedida}`}
                                  onCambiarEstado={unidadMedida.activo ? () => onDesactivar(unidadMedida) : undefined}
                                  ocupado={ocupado} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TablaUnidadesMedida;