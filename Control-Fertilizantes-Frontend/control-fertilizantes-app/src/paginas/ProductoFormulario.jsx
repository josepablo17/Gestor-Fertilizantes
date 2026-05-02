import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormularioProducto from "../componentes/productos/FormularioProducto";
import { obtenerProductoPorId } from "../api/productosApi";
import { mostrarError } from "../utils/alertas";
import Loader from "../componentes/Loader";

function ProductoFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [productoEditar, setProductoEditar] = useState(null);
  const [cargando, setCargando] = useState(false);

  const estaEditando = Boolean(id);

  useEffect(() => {
    if (estaEditando) {
      cargarProductoPorId();
    }
  }, [id]);

  const cargarProductoPorId = async () => {
    try {
      setCargando(true);

      const producto = await obtenerProductoPorId(id);
      setProductoEditar(producto);
    } catch (error) {
      await mostrarError(
        "Ocurrió un error",
        "No se pudo cargar la información del producto."
      );
      console.error(error);
      navigate("/productos");
    } finally {
      setCargando(false);
    }
  };

  const manejarProductoGuardado = () => {
    navigate("/productos");
  };

  const manejarCancelar = () => {
    navigate("/productos");
  };

  return (
    <section className="page">
      <header className="page__header">
        <div className="page__header-content">
          <h1 className="page__title">
            {estaEditando ? "Editar producto" : "Nuevo producto"}
          </h1>
          <p className="page__subtitle">
            {estaEditando
              ? "Actualiza la información del producto seleccionado."
              : "Completa el formulario para registrar un nuevo producto."}
          </p>
        </div>

        <div className="page__actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={manejarCancelar}
          >
            Volver al listado
          </button>
        </div>
      </header>

      <div className="page__body">
        <section className="card">
          <div className="card__body">
            {cargando ? (
              <Loader
                texto="Cargando información del producto..."
                alto="260px"
              />
            ) : (
              <FormularioProducto
                onProductoGuardado={manejarProductoGuardado}
                productoEditar={productoEditar}
                onCancelarEdicion={manejarCancelar}
              />
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

export default ProductoFormulario;