import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ListaUnidadesMedida from "../componentes/unidadesMedida/ListaUnidadesMedida";
import "../estilos/index.css";

function UnidadesMedida() {
    const [recargarLista, setRecargarLista] = useState(false);
    const navigate = useNavigate();

    const manejarUnidadMedidaDesactivada = () => {
        setRecargarLista((valorAnterior) => !valorAnterior);
    };

    const irANuevaUnidadMedida = () => {
        navigate("/unidadesMedida/nuevo");
    };

    const irAEditarUnidadMedida = (unidadMedida) => {
        navigate(`/unidadesMedida/editar/${unidadMedida.idUnidadMedida}`);
    };

    return (
        <section className="page">
            <header className="page__header">
                <div className="page__header-content">
                    <h1 className="page__title">Gestión de Unidades de Medida</h1>
                    <p className="page__subtitle">
                        Administra el catálogo de unidades de medida registradas en el sistema.
                    </p>
                </div>

                <div className="page__actions">
                    <button
                        type="button"
                        className="btn btn--primary btn--md"
                        onClick={irANuevaUnidadMedida}
                    >
                        Agregar unidad de medida
                    </button>
                </div>
            </header>

            <div className="page__body">
                <section className="card">
                    <div className="card__body">
                        <ListaUnidadesMedida
                            recargar={recargarLista}
                            onEditar={irAEditarUnidadMedida}
                            onUnidadMedidaDesactivada={manejarUnidadMedidaDesactivada}
                        />
                    </div>
                </section>
            </div>
        </section>
    );
}

export default UnidadesMedida;