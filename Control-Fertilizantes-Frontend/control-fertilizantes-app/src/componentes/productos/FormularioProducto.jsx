import { useEffect, useState } from "react";
import { insertarProducto, actualizarProducto } from "../../api/productosApi";
import { mostrarError, mostrarExito } from "../../utils/alertas";

const productoInicial = {
  idProducto: 0,
  nombre: "",
  categoria: "",
  marca: "",
  descripcion: ""
};

function FormularioProducto({ onProductoGuardado, productoEditar, onCancelarEdicion }) {
  const [producto, setProducto] = useState(productoInicial);

  const estaEditando = productoEditar !== null;

  useEffect(() => {
    if (productoEditar) {
      setProducto({
        idProducto: productoEditar.idProducto || 0,
        nombre: productoEditar.nombre || "",
        categoria: productoEditar.categoria || "",
        marca: productoEditar.marca || "",
        descripcion: productoEditar.descripcion || ""
      });
    } else {
      setProducto(productoInicial);
    }
  }, [productoEditar]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setProducto((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();

    try {
      if (estaEditando) {
        await actualizarProducto(producto);
        await mostrarExito("Producto actualizado", "El producto se actualizó correctamente.");
      } else {
        await insertarProducto(producto);
        await mostrarExito("Producto guardado", "El producto se registró correctamente.");
      }

      setProducto(productoInicial);

      if (onProductoGuardado) {
        onProductoGuardado();
      }
    } catch (error) {
      await mostrarError(
        "Ocurrió un error",
        estaEditando
          ? "No se pudo actualizar el producto."
          : "No se pudo registrar el producto."
      );
      console.error(error);
    }
  };

  const manejarCancelar = () => {
    setProducto(productoInicial);

    if (onCancelarEdicion) {
      onCancelarEdicion();
    }
  };

  return (
    <div className="seccion-formulario-productos">
      <div className="titulo-seccion">
        <h2>{estaEditando ? "Editar Producto" : "Agregar Producto"}</h2>
        <p>
          {estaEditando
            ? "Modifica la información del producto seleccionado."
            : "Completa los campos para registrar un nuevo producto."}
        </p>
      </div>

      <form className="formulario-producto" onSubmit={manejarSubmit}>
        <div className="campo-formulario">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            type="text"
            name="nombre"
            placeholder="Ejemplo: Urea"
            value={producto.nombre}
            onChange={manejarCambio}
            required
          />
        </div>

        <div className="campo-formulario">
          <label htmlFor="categoria">Categoría</label>
          <input
            id="categoria"
            type="text"
            name="categoria"
            placeholder="Ejemplo: Fertilizante"
            value={producto.categoria}
            onChange={manejarCambio}
            required
          />
        </div>

        <div className="campo-formulario">
          <label htmlFor="marca">Marca</label>
          <input
            id="marca"
            type="text"
            name="marca"
            placeholder="Ejemplo: Genérica"
            value={producto.marca}
            onChange={manejarCambio}
            required
          />
        </div>

        <div className="campo-formulario campo-formulario-completo">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            placeholder="Describe el producto..."
            value={producto.descripcion}
            onChange={manejarCambio}
            rows="4"
          />
        </div>

        <div className="acciones-formulario">
          {estaEditando && (
            <button
              type="button"
              className="boton-secundario"
              onClick={manejarCancelar}
            >
              Cancelar
            </button>
          )}

          <button type="submit" className="boton-primario">
            {estaEditando ? "Actualizar producto" : "Guardar producto"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormularioProducto;