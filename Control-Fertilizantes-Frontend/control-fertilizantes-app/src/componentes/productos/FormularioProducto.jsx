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

function FormularioProducto({
  onProductoGuardado,
  productoEditar,
  onCancelarEdicion
}) {
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
        await mostrarExito(
          "Producto actualizado",
          "El producto se actualizó correctamente."
        );
      } else {
        await insertarProducto(producto);
        await mostrarExito(
          "Producto guardado",
          "El producto se registró correctamente."
        );
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
  <>
    <div className="page-section__header">
      <div>
        <h2 className="page-section__title">
          {estaEditando ? "Editar producto" : "Agregar producto"}
        </h2>
        <p className="page-section__subtitle">
          {estaEditando
            ? "Modifica la información del producto seleccionado."
            : "Completa los campos para registrar un nuevo producto."}
        </p>
      </div>
    </div>

    <form className="form" onSubmit={manejarSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="nombre">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            name="nombre"
            placeholder="Ejemplo: Urea"
            value={producto.nombre}
            onChange={manejarCambio}
            className="input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="categoria">
            Categoría
          </label>
          <input
            id="categoria"
            type="text"
            name="categoria"
            placeholder="Ejemplo: Fertilizante"
            value={producto.categoria}
            onChange={manejarCambio}
            className="input"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="marca">
            Marca
          </label>
          <input
            id="marca"
            type="text"
            name="marca"
            placeholder="Ejemplo: Genérica"
            value={producto.marca}
            onChange={manejarCambio}
            className="input"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="descripcion">
          Descripción
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          placeholder="Describe el producto..."
          value={producto.descripcion}
          onChange={manejarCambio}
          className="textarea"
        />
      </div>

      <div className="form-actions">
        {estaEditando && (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={manejarCancelar}
          >
            Cancelar
          </button>
        )}

        <button type="submit" className="btn btn--primary">
          {estaEditando ? "Actualizar producto" : "Guardar producto"}
        </button>
      </div>
    </form>
  </>
);
}

export default FormularioProducto;