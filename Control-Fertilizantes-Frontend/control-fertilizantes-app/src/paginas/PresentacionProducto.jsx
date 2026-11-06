import { Link } from "react-router-dom";
import Pagina, { Tarjeta } from "../componentes/comunes/Pagina.jsx";
import ListaPresentacionProductos from "../componentes/presentacionProductos/ListaPresentacionProductos.jsx";

export default function PresentacionProducto() {
  return (
    <Pagina titulo="Gestión de presentaciones de producto"
      descripcion="Administra las presentaciones registradas para cada producto en el sistema."
      acciones={<Link className="btn btn--primary btn--md" to="/presentacionProductos/nuevo">Agregar presentación</Link>}>
      <Tarjeta titulo="Lista de presentaciones de producto">
        <ListaPresentacionProductos />
      </Tarjeta>
    </Pagina>
  );
}
