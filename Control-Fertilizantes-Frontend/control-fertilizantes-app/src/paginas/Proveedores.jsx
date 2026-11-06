import { Link } from "react-router-dom";
import Pagina, { Tarjeta } from "../componentes/comunes/Pagina.jsx";
import ListaProveedores from "../componentes/proveedores/ListaProveedores.jsx";

export default function Proveedores() {
  return (
    <Pagina titulo="Gestión de Proveedores"
      descripcion="Administra el catálogo de proveedores registrados en el sistema."
      acciones={<Link className="btn btn--primary btn--md" to="/proveedores/nuevo">Agregar proveedor</Link>}>
      <Tarjeta titulo="Lista de proveedores">
        <ListaProveedores />
      </Tarjeta>
    </Pagina>
  );
}
