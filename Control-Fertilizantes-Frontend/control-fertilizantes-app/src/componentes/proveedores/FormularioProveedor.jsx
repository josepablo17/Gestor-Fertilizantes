import { useEffect,useState } from "react";
import {insertarProveedor,actualizarProveedor} from "../../api/proveedorApi";
import { mostrarError,mostrarExito } from "../../utils/alertas";

const proveedorInicial={
    idProveedor:0,
    nombre:"",
    contacto:"",
    telefono:"",
    correo:"",
    esProveedorAutorizado:true
};

function FormularioProveedor({
    onProveedorGuardado,
    proveedorEditar,
    onCancelarEdicion
}) {
    const [proveedor, setProveedor] = useState(proveedorInicial);
    const estaEditando = proveedorEditar !== null;

    useEffect(() => {
        if (proveedorEditar) {
            setProveedor({
                idProveedor: proveedorEditar.idProveedor || 0,
                nombre: proveedorEditar.nombre || "",
                contacto: proveedorEditar.contacto || "",
                telefono: proveedorEditar.telefono || "",
                correo: proveedorEditar.correo || "",
                esProveedorAutorizado: proveedorEditar.esProveedorAutorizado ?? true
            });
        } else {
            setProveedor(proveedorInicial);
        }
    }, [proveedorEditar]);

    const manejarCambio = (e) => {
        const { name, value, type, checked } = e.target;

        setProveedor((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const manejarSubmit = async (e) => {
        e.preventDefault();

        try {
            if (estaEditando) {
                await actualizarProveedor(proveedor);
                await mostrarExito("Proveedor actualizado", "El proveedor se actualizó correctamente.");
            } else {
                await insertarProveedor(proveedor);
                await mostrarExito("Proveedor guardado", "El proveedor se registró correctamente.");
            }

            setProveedor(proveedorInicial);

            if (onProveedorGuardado) {
                onProveedorGuardado();
            }
        } catch (error) {
            await mostrarError(
                "Ocurrió un error",
                estaEditando
                    ? "No se pudo actualizar el proveedor."
                    : "No se pudo registrar el proveedor."
            );
            console.error(error);
        }
    };

    const manejarCancelar = () => {
        setProveedor(proveedorInicial);

        if (onCancelarEdicion) {
            onCancelarEdicion();
        }
    };

    return (
        <section className="page-section">

            {/* HEADER */}
            <div className="page-section__header">
                <div>
                    <h2 className="page-section__title">
                        {estaEditando ? "Editar proveedor" : "Agregar proveedor"}
                    </h2>
                    <p className="page-section__subtitle">
                        {estaEditando
                            ? "Modifica la información del proveedor seleccionado."
                            : "Completa los campos para registrar un nuevo proveedor."}
                    </p>
                </div>
            </div>

            {/* FORM */}
            <form className="form" onSubmit={manejarSubmit}>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="nombre" className="form-label">Nombre</label>
                        <input
                            id="nombre"
                            type="text"
                            name="nombre"
                            className="input"
                            placeholder="Ejemplo: Surco"
                            value={proveedor.nombre}
                            onChange={manejarCambio}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contacto" className="form-label">Contacto</label>
                        <input
                            id="contacto"
                            type="text"
                            name="contacto"
                            className="input"
                            placeholder="Ejemplo: Carlos Rodríguez"
                            value={proveedor.contacto}
                            onChange={manejarCambio}
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="telefono" className="form-label">Teléfono</label>
                        <input
                            id="telefono"
                            type="text"
                            name="telefono"
                            className="input"
                            placeholder="Ejemplo: 88889999"
                            value={proveedor.telefono}
                            onChange={manejarCambio}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="correo" className="form-label">Correo</label>
                        <input
                            id="correo"
                            type="email"
                            name="correo"
                            className="input"
                            placeholder="Ejemplo: carlos@gmail.com"
                            value={proveedor.correo}
                            onChange={manejarCambio}
                            required
                        />
                    </div>
                </div>

                {/* CHECKBOX */}
                <div className="form-group">
                    <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                            type="checkbox"
                            name="esProveedorAutorizado"
                            checked={proveedor.esProveedorAutorizado}
                            onChange={manejarCambio}
                        />
                        Proveedor autorizado
                    </label>
                </div>

                {/* ACTIONS */}
                <div className="form-actions">
                    {estaEditando && (
                        <button
                            type="button"
                            className="btn btn--secondary btn--md"
                            onClick={manejarCancelar}
                        >
                            Cancelar
                        </button>
                    )}

                    <button type="submit" className="btn btn--primary btn--md">
                        {estaEditando ? "Actualizar proveedor" : "Guardar proveedor"}
                    </button>
                </div>
            </form>
        </section>
    );
}

export default FormularioProveedor;