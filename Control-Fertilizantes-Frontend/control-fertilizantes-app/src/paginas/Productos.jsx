import { Link } from "react-router-dom";
import Pagina, { Tarjeta } from "../componentes/comunes/Pagina.jsx";
import ListaProductos from "../componentes/productos/ListaProductos.jsx";

export default function Productos() {
  return (
    <Pagina titulo="Gestión de productos"
      descripcion="Administra el catálogo de fertilizantes registrados en el sistema."
      acciones={<Link className="btn btn--primary btn--md" to="/productos/nuevo">Agregar producto</Link>}>
      <Tarjeta titulo="Lista de productos">
        <ListaProductos />
      </Tarjeta>
    </Pagina>
  );
}
