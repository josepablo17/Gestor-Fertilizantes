import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormularioUnidadMedida from "../componentes/unidadesMedida/FormularioUnidadesMedida";
import { obtenerUnidadMedidaPorId } from "../api/unidadMedidaApi";
import { mostrarError } from "../utils/alertas";
import Loader from "../componentes/Loader";
import "../estilos/loader.css";

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
                <div className="encabezado-modulo encabezado-con-acciones">
                    <div>
                        <h1>{estaEditando ? "Editar Unidad de Medida" : "Nueva Unidad de Medida"}</h1>
                        <p>
                            {estaEditando
                                ? "Actualiza la información de la unidad de medida seleccionada."
                                : "Completa el formulario para registrar una nueva unidad de medida."}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="boton-base boton-secundario"
                        onClick={manejarCancelar}
                    >
                        Volver al listado
                    </button>
                </div>

                <div className="card-modulo">
                    {cargando ? (
                        <Loader texto="Cargando información de la unidad de medida..." alto="260px" />
                    ) : (
                        <FormularioUnidadMedida
                            onUnidadMedidaGuardada={manejarUnidadMedidaGuardada}
                            unidadMedidaEditar={unidadMedidaEditar}
                            onCancelarEdicion={manejarCancelar}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default UnidadMedidaFormulario;