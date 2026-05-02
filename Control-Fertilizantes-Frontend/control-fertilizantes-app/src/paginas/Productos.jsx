import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ListaProductos from "../componentes/productos/ListaProductos";

function Productos() {
  const [recargarLista, setRecargarLista] = useState(false);
  const navigate = useNavigate();

  const manejarProductoDesactivado = () => {
    setRecargarLista((valorAnterior) => !valorAnterior);
  };

  const irANuevoProducto = () => {
    navigate("/productos/nuevo");
  };

  const irAEditarProducto = (producto) => {
    navigate(`/productos/editar/${producto.idProducto}`);
  };

  return (
    <section className="page">
      <header className="page__header">
        <div className="page__header-content">
          <h1 className="page__title">Gestión de productos</h1>
          <p className="page__subtitle">
            Administra el catálogo de fertilizantes registrados en el sistema.
          </p>
        </div>

        <div className="page__actions">
          <button
            type="button"
            className="btn btn--primary btn--md"
            onClick={irANuevoProducto}
          >
            Agregar producto
          </button>
        </div>
      </header>

      <div className="page__body">
        <section className="card">
          <div className="card__body">
            <ListaProductos
              recargar={recargarLista}
              onEditar={irAEditarProducto}
              onProductoDesactivado={manejarProductoDesactivado}
            />
          </div>
        </section>
      </div>
    </section>
  );
}

export default Productos;