import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ListaCompras from "../componentes/compras/ListaCompras";
import "../estilos/index.css";

function Compras() {
  const [recargarLista] = useState(false);
  const navigate = useNavigate();

  const irANuevaCompra = () => {
    navigate("/compras/nuevo");
  };

  const irAEditarCompra = (compra) => {
    navigate(`/compras/editar/${compra.idCompra}`);
  };

  return (
    <section className="page">
      <header className="page__header">
        <div className="page__header-content">
          <h1 className="page__title">Gestión de Compras</h1>
          <p className="page__subtitle">
            Administra y registra las compras realizadas en el sistema.
          </p>
        </div>

        <div className="page__actions">
          <button
            type="button"
            className="btn btn--primary btn--md"
            onClick={irANuevaCompra}
          >
            Registrar compra
          </button>
        </div>
      </header>

      <div className="page__body">
        <section className="card">
          <div className="card__body">
            <ListaCompras
              recargar={recargarLista}
              onEditar={irAEditarCompra}
            />
          </div>
        </section>
      </div>
    </section>
  );
}

export default Compras;