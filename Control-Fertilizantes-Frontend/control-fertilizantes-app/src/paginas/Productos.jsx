import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ListaProductos from "../componentes/productos/ListaProductos";
import "../estilos/productos.css";

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
    <div className="pagina-productos">
      <div className="contenedor-productos">
        <div className="encabezado-productos encabezado-con-acciones">
          <div>
            <h1>Gestión de Productos</h1>
            <p>Administra el catálogo de fertilizantes registrados en el sistema.</p>
          </div>

          <button className="boton-primario" onClick={irANuevoProducto}>
            Agregar producto
          </button>
        </div>

        <div className="card-productos">
          <ListaProductos
            recargar={recargarLista}
            onEditar={irAEditarProducto}
            onProductoDesactivado={manejarProductoDesactivado}
          />
        </div>
      </div>
    </div>
  );
}

export default Productos;