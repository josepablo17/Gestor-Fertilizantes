import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormularioPresentacionProducto from "../componentes/presentacionProductos/FormularioPresentacionProducto";
import { obtenerPresentacionProductoPorId } from "../api/presentacionProductoApi";
import { mostrarError } from "../utils/alertas";
import Loader from "../componentes/Loader";

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
    <section className="page">
      <header className="page__header">
        <div className="page__header-content">
          <h1 className="page__title">
            {estaEditando ? "Editar presentación" : "Nueva presentación"}
          </h1>
          <p className="page__subtitle">
            {estaEditando
              ? "Actualiza la información de la presentación seleccionada."
              : "Completa el formulario para registrar una nueva presentación de producto."}
          </p>
        </div>

        <div className="page__actions">
          <button
            type="button"
            className="btn btn--secondary btn--md"
            onClick={manejarCancelar}
          >
            Volver al listado
          </button>
        </div>
      </header>

      <div className="page__body">
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
    </section>
  );
}

export default PresentacionProductoFormulario;