import {
    formatearEstado,
    formatearFactorConversion,
    formatearUnidadBase
} from "../../utils/unidadesMedida";

function TablaUnidadesMedida({ unidadesMedida, onEditar, onDesactivar }) {
    return (
        <div className="tabla-responsive">
            <table className="tabla-modulo">
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
                                <div className="celda-principal">
                                    <span className="texto-principal">
                                        {unidadMedida.codigo || "Sin código"}
                                    </span>
                                </div>
                            </td>

                            <td>
                                <span className="texto-secundario">
                                    {unidadMedida.nombre || "Sin nombre"}
                                </span>
                            </td>

                            <td>
                                <span className="texto-secundario">
                                    {unidadMedida.tipoBase || "Sin tipo base"}
                                </span>
                            </td>

                            <td>
                                <span className="texto-secundario">
                                    {formatearFactorConversion(unidadMedida.factorConversion)}
                                </span>
                            </td>

                            <td>
                                <span
                                    className={
                                        unidadMedida.esUnidadBase
                                            ? "estado-badge estado-activo"
                                            : "estado-badge estado-inactivo"
                                    }
                                >
                                    <span className="punto-estado"></span>
                                    {formatearUnidadBase(unidadMedida.esUnidadBase)}
                                </span>
                            </td>

                            <td>
                                <span
                                    className={
                                        unidadMedida.activo
                                            ? "estado-badge estado-activo"
                                            : "estado-badge estado-inactivo"
                                    }
                                >
                                    <span className="punto-estado"></span>
                                    {formatearEstado(unidadMedida.activo)}
                                </span>
                            </td>

                            <td>
                                <div className="acciones-tabla">
                                    <button
                                        className="boton-base boton-tabla boton-editar"
                                        onClick={() => onEditar(unidadMedida)}
                                        type="button"
                                    >
                                        Editar
                                    </button>

                                    {unidadMedida.activo && (
                                        <button
                                            className="boton-base boton-tabla boton-eliminar"
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