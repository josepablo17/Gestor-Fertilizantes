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
        <section className="page">
            <header className="page__header">
                <div className="page__header-content">
                    <h1 className="page__title">Gestión de Proveedores</h1>
                    <p className="page__subtitle">
                        Administra el catálogo de proveedores registrados en el sistema.
                    </p>
                </div>

                <div className="page__actions">
                    <button
                        type="button"
                        className="btn btn--primary btn--md"
                        onClick={irANuevoProveedor}
                    >
                        Agregar proveedor
                    </button>
                </div>
            </header>

            <div className="page__body">
                <section className="card">
                    <div className="card__body">
                <ListaProveedores
                    recargarLista={recargarLista}
                    onEditar={irAEditarProveedor}
                    onProductoDesactivado={manejarProveedorDesactivado}
                />
                </div>
                </section>
            </div>
        </section>
    );
}

export default Proveedores;