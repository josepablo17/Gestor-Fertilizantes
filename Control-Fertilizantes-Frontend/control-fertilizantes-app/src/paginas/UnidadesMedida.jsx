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
        <div className="pagina-modulo">
            <div className="contenedor-modulo">
                <div className="encabezado-modulo encabezado-con-acciones">
                    <div>
                        <h1>Gestión de Unidades de Medida</h1>
                        <p>Administra el catálogo de unidades de medida registradas en el sistema.</p>
                    </div>

                    <button className="boton-base boton-primario" onClick={irANuevaUnidadMedida}>
                        Agregar unidad de medida
                    </button>
                </div>

                <div className="card-modulo">
                    <ListaUnidadesMedida
                        recargar={recargarLista}
                        onEditar={irAEditarUnidadMedida}
                        onUnidadMedidaDesactivada={manejarUnidadMedidaDesactivada}
                    />
                </div>
            </div>
        </div>
    );
}

export default UnidadesMedida;