import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormularioUnidadMedida from "../componentes/unidadesMedida/FormularioUnidadesMedida";
import { obtenerUnidadMedidaPorId } from "../api/unidadMedidaApi";
import { mostrarError } from "../utils/alertas";
import Loader from "../componentes/Loader";

function UnidadMedidaFormulario() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [unidadMedidaEditar, setUnidadMedidaEditar] = useState(null);
    const [cargando, setCargando] = useState(false);

    const estaEditando = Boolean(id);

    useEffect(() => {
        if (estaEditando) {
            cargarUnidadMedidaPorId();
        }
    }, [id]);

    const cargarUnidadMedidaPorId = async () => {
        try {
            setCargando(true);

            const unidadMedida = await obtenerUnidadMedidaPorId(id);
            setUnidadMedidaEditar(unidadMedida);
        } catch (error) {
            await mostrarError(
                "Ocurrió un error",
                "No se pudo cargar la información de la unidad de medida."
            );
            navigate("/unidadesMedida");
            console.error(error);
        } finally {
            setCargando(false);
        }
    };

    const manejarUnidadMedidaGuardada = () => {
        navigate("/unidadesMedida");
    };

    const manejarCancelar = () => {
        navigate("/unidadesMedida");
    };

    return (
        <div className="pagina-modulo">
            <div className="contenedor-modulo">
                <section className="card">
                    <div className="card__header">
                        <div>
                            <h1 className="card__title">
                                {estaEditando ? "Editar Unidad de Medida" : "Nueva Unidad de Medida"}
                            </h1>
                            <p className="card__subtitle">
                                {estaEditando
                                    ? "Actualiza la información de la unidad de medida seleccionada."
                                    : "Completa el formulario para registrar una nueva unidad de medida."}
                            </p>
                        </div>

                        <button
                            type="button"
                            className="btn btn--secondary btn--md"
                            onClick={manejarCancelar}
                        >
                            Volver al listado
                        </button>
                    </div>

                    <div className="card__body">
                        {cargando ? (
                            <Loader
                                texto="Cargando información de la unidad de medida..."
                                alto="260px"
                            />
                        ) : (
                            <FormularioUnidadMedida
                                onUnidadMedidaGuardada={manejarUnidadMedidaGuardada}
                                unidadMedidaEditar={unidadMedidaEditar}
                                onCancelarEdicion={manejarCancelar}
                            />
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default UnidadMedidaFormulario;