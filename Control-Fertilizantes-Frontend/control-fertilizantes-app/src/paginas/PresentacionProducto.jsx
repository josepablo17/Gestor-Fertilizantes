import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ListaPresentacionProductos from "../componentes/presentacionProductos/ListaPresentacionProductos";
import "../estilos/index.css";

function PresentacionesProducto() {
  const [recargarLista, setRecargarLista] = useState(false);
  const navigate = useNavigate();

  const manejarPresentacionDesactivada = () => {
    setRecargarLista((valorAnterior) => !valorAnterior);
  };

  const irANuevaPresentacion = () => {
    navigate("/presentacionProductos/nuevo");
  };

  const irAEditarPresentacion = (presentacion) => {
    navigate(`/presentacionProductos/editar/${presentacion.idPresentacionProducto}`);
  };

  return (
    <section className="page">
      <header className="page__header">
        <div className="page__header-content">
          <h1 className="page__title">Gestión de presentaciones de producto</h1>
          <p className="page__subtitle">
            Administra las presentaciones registradas para cada producto en el sistema.
          </p>
        </div>

        <div className="page__actions">
          <button
            type="button"
            className="btn btn--primary btn--md"
            onClick={irANuevaPresentacion}
          >
            Agregar presentación
          </button>
        </div>
      </header>

      <div className="page__body">
        <section className="card">
          <div className="card__body">
            <ListaPresentacionProductos
              recargar={recargarLista}
              onEditar={irAEditarPresentacion}
              onPresentacionDesactivada={manejarPresentacionDesactivada}
            />
          </div>
        </section>
      </div>
    </section>
  );
}

export default PresentacionesProducto;