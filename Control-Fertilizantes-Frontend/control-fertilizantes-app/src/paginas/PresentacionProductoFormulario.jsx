import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormularioPresentacionProducto from "../componentes/presentacionProductos/FormularioPresentacionProducto";
import { obtenerPresentacionProductoPorId } from "../api/presentacionProductoApi";
import { mostrarError } from "../utils/alertas";
import Loader from "../componentes/Loader";
import "../estilos/loader.css";

function PresentacionProductoFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [presentacionEditar, setPresentacionEditar] = useState(null);
  const [cargando, setCargando] = useState(false);

  const estaEditando = Boolean(id);

  useEffect(() => {
    if (estaEditando) {
      cargarPresentacionPorId();
    }
  }, [id]);

  const cargarPresentacionPorId = async () => {
    try {
      setCargando(true);

      const presentacion = await obtenerPresentacionProductoPorId(id);
      setPresentacionEditar(presentacion);
    } catch (error) {
      await mostrarError(
        "Ocurrió un error",
        "No se pudo cargar la información de la presentación del producto."
      );
      navigate("/presentacionProductos");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const manejarPresentacionGuardada = () => {
    navigate("/presentacionProductos");
  };

  const manejarCancelar = () => {
    navigate("/presentacionProductos");
  };

  return (
    <div className="pagina-modulo">
      <div className="contenedor-modulo">
        <div className="encabezado-modulo encabezado-con-acciones">
          <div>
            <h1>{estaEditando ? "Editar Presentación" : "Nueva Presentación"}</h1>
            <p>
              {estaEditando
                ? "Actualiza la información de la presentación seleccionada."
                : "Completa el formulario para registrar una nueva presentación de producto."}
            </p>
          </div>

          <button
            type="button"
            className="boton-base boton-secundario"
            onClick={manejarCancelar}
          >
            Volver al listado
          </button>
        </div>

        <div className="card-modulo">
          {cargando ? (
            <Loader texto="Cargando información de la presentación..." alto="260px" />
          ) : (
            <FormularioPresentacionProducto
              onPresentacionGuardada={manejarPresentacionGuardada}
              presentacionEditar={presentacionEditar}
              onCancelarEdicion={manejarCancelar}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PresentacionProductoFormulario;