import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormularioProveedor from "../componentes/proveedores/FormularioProveedor";
import { obtenerProveedorPorId } from "../api/proveedorApi";
import { mostrarError } from "../utils/alertas";
import Loader from "../componentes/Loader"
import "../estilos/loader.css"

function ProveedorFormulario(){
    const navigate = useNavigate();
    const {id} =  useParams();

    const [proveedorEditar,setProveedorEditar] = useState(null);
    const [cargando,setCargando] = useState(false);

    const estaEditando = Boolean(id);

    useEffect(()=>{
        if (estaEditando){
            cargarProveedorPorId();
        }
    },[id]);

    const cargarProveedorPorId = async () =>{
        try{
            setCargando(true);

            const proveedor = await obtenerProveedorPorId(id);
            setProveedorEditar(proveedor);
        }catch (error){
            await mostrarError(
                "Ocurrió un error",
                "No se pudo cargar la información del producto."
            );
            navigate("/proveedores");
            console.error(error);
        } finally{
            setCargando(false);
        }
    };

    const manejarProveedorGuardado = ()=>{
        navigate("/proveedores");
    };

    const manejarCancelar = () =>{
        navigate("/proveedores");
    };


    return (
    <div className="pagina-modulo">
        <div className="contenedor-modulo">
            <div className="encabezado-modulo encabezado-con-acciones">
                <div>
                    <h1>{estaEditando ? "Editar Proveedor " : "Nuevo Proveedor"}</h1>
                    <p>
                        {estaEditando
                            ? "Actualiza la información del proveedor seleccionado."
                            : "Completa el formulario para registrar un nuevo proveedor."}
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
                    <Loader texto="Cargando información del producto..." alto="260px" />
                ) : (
                    <FormularioProveedor
                        onProveedorGuardado={manejarProveedorGuardado}
                        proveedorEditar={proveedorEditar}
                        onCancelarEdicion={manejarCancelar}
                    />
                )}
            </div>
        </div>
    </div>
);
}
export default ProveedorFormulario;