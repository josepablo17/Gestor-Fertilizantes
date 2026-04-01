import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ListaProveedores from "../componentes/proveedores/ListaProveedores";
import "../estilos/index.css";

function Proveedores() {
    const [recargarLista, setRecargarLista] = useState(false);
    const navigate = useNavigate();

    const manejarProveedorDesactivado = () => {
        setRecargarLista((valorAnterior) => !valorAnterior);
    };

    const irANuevoProveedor = () => {
        navigate("/proveedores/nuevo");
    };

    const irAEditarProveedor = (proveedor) => {
        navigate(`/proveedores/editar/${proveedor.idProveedor}`);
    };

    return (
        <div className="pagina-modulo">
            <div className="contenedor-modulo">
                <div className="encabezado-modulo encabezado-con-acciones">
                    <div>
                        <h1>Gestión de Proveedores</h1>
                        <p>Administra el catálogo de proveedores registrados en el sistema.</p>
                    </div>

                    <button className="boton-base boton-primario" onClick={irANuevoProveedor}>
                        Agregar proveedor
                    </button>
                </div>

                <div className="card-modulo">
                    <ListaProveedores
                        recargarLista={recargarLista}
                        onEditar={irAEditarProveedor}
                        onProductoDesactivado={manejarProveedorDesactivado}
                    />
                </div>
            </div>
        </div>
    );
}

export default Proveedores;