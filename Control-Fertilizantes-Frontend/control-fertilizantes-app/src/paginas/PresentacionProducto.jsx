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
    <div className="pagina-modulo">
      <div className="contenedor-modulo">
        <div className="encabezado-modulo encabezado-con-acciones">
          <div>
            <h1>Gestión de Presentaciones de Producto</h1>
            <p>Administra las presentaciones registradas para cada producto en el sistema.</p>
          </div>

          <button className="boton-base boton-primario" onClick={irANuevaPresentacion}>
            Agregar presentación
          </button>
        </div>

        <div className="card-modulo">
          <ListaPresentacionProductos
            recargar={recargarLista}
            onEditar={irAEditarPresentacion}
            onPresentacionDesactivada={manejarPresentacionDesactivada}
          />
        </div>
      </div>
    </div>
  );
}

export default PresentacionesProducto;