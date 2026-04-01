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

function FormularioProveedor({onProveedorGuardado,proveedorEditar,onCancelarEdicion}){
    const [proveedor,setProveedor] = useState(proveedorInicial);
    const estaEditando = proveedorEditar !== null;

    useEffect(()=>{
        if (proveedorEditar){
            setProveedor({
                idProveedor:proveedorEditar.idProveedor || 0,
                nombre:proveedorEditar.nombre||"",
                contacto:proveedorEditar.contacto||"",
                telefono:proveedorEditar.telefono||"",
                correo:proveedorEditar.correo||"",
                esProveedorAutorizado:proveedorEditar.esProveedorAutorizado ?? true
            });
        }else{
            setProveedor(proveedorInicial);
        }
    },[proveedorEditar]);

    const manejarCambio=(e)=>{
        const { name, value, type, checked } = e.target;

        setProveedor((prev)=>({
            ...prev,
            [name]:type==="checkbox"?checked:value
        }));
    };

    const manejarSubmit =  async(e)=>{
        e.preventDefault();

        try{
            if(estaEditando){
                await actualizarProveedor(proveedor);
                await mostrarExito("Proveedor actualizado","El proveedor se actualizó correctamente.");
            }else{
                await insertarProveedor(proveedor);
                await mostrarExito("Proveedor guardado","El proveedor se registro correctamente.");
            }

            setProveedor(proveedorInicial);

            if(onProveedorGuardado){
                onProveedorGuardado();
            }
        } catch (error){
            await mostrarError(
                "Ocurrió un error",
                estaEditando
                ? "No se pudo actualizar el proveedor."
                : "No se pudo registar el proveedor."
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
        <div className="card-modulo">
            <div className="titulo-seccion">
                <h2>{estaEditando ? "Editar Proveedor" : "Agregar Proveedor"}</h2>
                <p>
                    {estaEditando
                        ? "Modifica la información del proveedor seleccionado."
                        : "Completa los campos para registrar un nuevo proveedor."}
                </p>
            </div>

            <form className="formulario-modulo" onSubmit={manejarSubmit}>
                <div className="campo-formulario">
                    <label htmlFor="nombre">Nombre</label>
                    <input
                        id="nombre"
                        type="text"
                        name="nombre"
                        placeholder="Ejemplo: Surco"
                        value={proveedor.nombre}
                        onChange={manejarCambio}
                        required
                    />
                </div>

                <div className="campo-formulario">
                    <label htmlFor="contacto">Contacto</label>
                    <input
                        id="contacto"
                        type="text"
                        name="contacto"
                        placeholder="Ejemplo: Carlos Rodríguez"
                        value={proveedor.contacto}
                        onChange={manejarCambio}
                        required
                    />
                </div>

                <div className="campo-formulario">
                    <label htmlFor="telefono">Telefono</label>
                    <input
                        id="telefono"
                        type="text"
                        name="telefono"
                        placeholder="Ejemplo: 88889999"
                        value={proveedor.telefono}
                        onChange={manejarCambio}
                        required
                    />
                </div>

                <div className="campo-formulario">
                    <label htmlFor="correo">Correo</label>
                    <input
                        id="correo"
                        type="email"
                        name="correo"
                        placeholder="Ejemplo: carlos@gmail.com"
                        value={proveedor.correo}
                        onChange={manejarCambio}
                        required
                    />
                </div>

                <div className="campo-formulario campo-formulario-completo">
                    <div className="campo-checkbox">
                        <label htmlFor="esProveedorAutorizado" className="label-checkbox">
                            <input
                                id="esProveedorAutorizado"
                                type="checkbox"
                                name="esProveedorAutorizado"
                                checked={proveedor.esProveedorAutorizado}
                                onChange={manejarCambio}
                            />
                            Proveedor autorizado
                        </label>
                    </div>
                </div>

                <div className="acciones-formulario">
                    {estaEditando && (
                        <button
                            type="button"
                            className="boton-base boton-secundario"
                            onClick={manejarCancelar}
                        >
                            Cancelar
                        </button>
                    )}

                    <button type="submit" className="boton-base boton-primario">
                        {estaEditando ? "Actualizar proveedor" : "Guardar proveedor"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default FormularioProveedor;