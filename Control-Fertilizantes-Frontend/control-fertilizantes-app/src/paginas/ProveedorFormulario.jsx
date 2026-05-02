import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormularioProveedor from "../componentes/proveedores/FormularioProveedor";
import { obtenerProveedorPorId } from "../api/proveedorApi";
import { mostrarError } from "../utils/alertas";
import Loader from "../componentes/Loader";

function ProveedorFormulario() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [proveedorEditar, setProveedorEditar] = useState(null);
    const [cargando, setCargando] = useState(false);

    const estaEditando = Boolean(id);

    useEffect(() => {
        if (estaEditando) {
            cargarProveedorPorId();
        }
    }, [id]);

    const cargarProveedorPorId = async () => {
        try {
            setCargando(true);

            const proveedor = await obtenerProveedorPorId(id);
            setProveedorEditar(proveedor);
        } catch (error) {
            await mostrarError(
                "Ocurrió un error",
                "No se pudo cargar la información del proveedor."
            );
            navigate("/proveedores");
            console.error(error);
        } finally {
            setCargando(false);
        }
    };

    const manejarProveedorGuardado = () => {
        navigate("/proveedores");
    };

    const manejarCancelar = () => {
        navigate("/proveedores");
    };

    return (
        <section className="page">
            <header className="page__header">
                <div className="page__header-content">
                    <h1 className="page__title">
                        {estaEditando ? "Editar proveedor" : "Nuevo proveedor"}
                    </h1>
                    <p className="page__subtitle">
                        {estaEditando
                            ? "Actualiza la información del proveedor seleccionado."
                            : "Completa el formulario para registrar un nuevo proveedor."}
                    </p>
                </div>

                <div className="page__actions">
                    <button
                        type="button"
                        className="btn btn--secondary btn--md"
                        onClick={manejarCancelar}
                    >
                        Volver al listado
                    </button>
                </div>
            </header>

            <div className="page__body">
                <section className="card">
                    <div className="card__body">
                    {cargando ? (
                    <Loader texto="Cargando información del proveedor..." alto="260px" />
                ) : (
                    <FormularioProveedor
                        onProveedorGuardado={manejarProveedorGuardado}
                        proveedorEditar={proveedorEditar}
                        onCancelarEdicion={manejarCancelar}
                    />
                )}
                    </div>
                </section>
            </div>
        </section>
    );
}

export default ProveedorFormulario;