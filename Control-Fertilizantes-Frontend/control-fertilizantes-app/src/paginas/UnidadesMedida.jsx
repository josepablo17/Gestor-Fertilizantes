import { Link } from "react-router-dom";
import Pagina, { Tarjeta } from "../componentes/comunes/Pagina.jsx";
import ListaUnidadesMedida from "../componentes/unidadesMedida/ListaUnidadesMedida.jsx";

export default function UnidadesMedida() {
  return (
    <Pagina titulo="Gestión de Unidades de Medida"
      descripcion="Administra el catálogo de unidades de medida registradas en el sistema."
      acciones={<Link className="btn btn--primary btn--md" to="/unidadesMedida/nuevo">Agregar unidad de medida</Link>}>
      <Tarjeta titulo="Lista de unidades de medida">
        <ListaUnidadesMedida />
      </Tarjeta>
    </Pagina>
  );
}
