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
    <div className="pagina-modulo">
      <div className="contenedor-modulo">
        <div className="encabezado-modulo encabezado-con-acciones">
          <div>
            <h1>Gestión de Compras</h1>
            <p>
              Administra y consulta las compras de fertilizantes registradas en el sistema.
            </p>
          </div>

          <button
            type="button"
            className="boton-base boton-primario"
            onClick={irANuevaCompra}
          >
            Registrar compra
          </button>
        </div>

        <div className="card-modulo">
          <ListaCompras
            recargar={recargarLista}
            onEditar={irAEditarCompra}
            onAgregar={irANuevaCompra}
          />
        </div>
      </div>
    </div>
  );
}

export default Compras;