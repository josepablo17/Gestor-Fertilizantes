import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormularioProducto from "../componentes/productos/FormularioProducto";
import { obtenerProductoPorId } from "../api/productosApi";
import { mostrarError } from "../utils/alertas";
import Loader from "../componentes/Loader"
import "../estilos/loader.css"

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
      navigate("/productos");
      console.error(error);
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
  <div className="pagina-modulo">
    <div className="contenedor-modulo">
      <div className="encabezado-modulo encabezado-con-acciones">
        <div>
          <h1>{estaEditando ? "Editar Producto" : "Nuevo Producto"}</h1>
          <p>
            {estaEditando
              ? "Actualiza la información del producto seleccionado."
              : "Completa el formulario para registrar un nuevo producto."}
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
          <Loader texto="Cargando información del producto..." alto="260px" />
        ) : (
          <FormularioProducto
            onProductoGuardado={manejarProductoGuardado}
            productoEditar={productoEditar}
            onCancelarEdicion={manejarCancelar}
          />
        )}
      </div>
    </div>
  </div>
);
}

export default ProductoFormulario;