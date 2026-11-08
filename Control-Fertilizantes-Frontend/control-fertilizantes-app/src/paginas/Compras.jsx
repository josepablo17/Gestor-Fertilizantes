import { Link } from "react-router-dom";
import Pagina, { Tarjeta } from "../componentes/comunes/Pagina.jsx";
import ListaCompras from "../modulos/compras/componentes/ListaDocumentosCompra.jsx";

export default function Compras() {
  return (
    <Pagina titulo="Gestión de Compras"
      descripcion="Administra y registra las compras realizadas en el sistema."
      acciones={<Link className="btn btn--primary btn--md" to="/compras/nuevo">Registrar compra</Link>}>
      <Tarjeta titulo="Lista de compras">
        <ListaCompras />
      </Tarjeta>
    </Pagina>
  );
}
