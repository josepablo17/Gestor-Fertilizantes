import { useEffect, useState } from "react";
import {
  insertarPresentacionProducto,
  actualizarPresentacionProducto,
  obtenerProductosDropdown,
  obtenerUnidadesMedidaDropdown
} from "../../api/presentacionProductoApi";
import { mostrarError, mostrarExito } from "../../utils/alertas";

const presentacionInicial = {
  idPresentacionProducto: 0,
  idProducto: "",
  descripcion: "",
  cantidad: "",
  idUnidadMedida: "",
  cantidadNormalizada: "",
  activo: true
};

function FormularioPresentacionProducto({
  onPresentacionGuardada,
  presentacionEditar,
  onCancelarEdicion
}) {
  const [presentacion, setPresentacion] = useState(presentacionInicial);
  const [productosDropdown, setProductosDropdown] = useState([]);
  const [unidadesDropdown, setUnidadesDropdown] = useState([]);
  const [cargandoCombos, setCargandoCombos] = useState(true);

  const estaEditando = presentacionEditar !== null;

  useEffect(() => {
    const cargarDropdowns = async () => {
      try {
        setCargandoCombos(true);

        const [productos, unidades] = await Promise.all([
          obtenerProductosDropdown(),
          obtenerUnidadesMedidaDropdown()
        ]);

        setProductosDropdown(productos);
        setUnidadesDropdown(unidades);
      } catch (error) {
        console.error(error);
        await mostrarError(
          "Ocurrió un error",
          "No se pudieron cargar los datos de los desplegables."
        );
      } finally {
        setCargandoCombos(false);
      }
    };

    cargarDropdowns();
  }, []);

  useEffect(() => {
    if (presentacionEditar) {
      setPresentacion({
        idPresentacionProducto: presentacionEditar.idPresentacionProducto || 0,
        idProducto: presentacionEditar.idProducto || "",
        descripcion: presentacionEditar.descripcion || "",
        cantidad: presentacionEditar.cantidad || "",
        idUnidadMedida: presentacionEditar.idUnidadMedida || "",
        cantidadNormalizada: presentacionEditar.cantidadNormalizada || "",
        activo: presentacionEditar.activo ?? true
      });
    } else {
      setPresentacion(presentacionInicial);
    }
  }, [presentacionEditar]);

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;

    setPresentacion((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...presentacion,
      idProducto: Number(presentacion.idProducto),
      cantidad: Number(presentacion.cantidad),
      idUnidadMedida: Number(presentacion.idUnidadMedida),
      cantidadNormalizada: Number(presentacion.cantidadNormalizada)
    };

    try {
      if (estaEditando) {
        await actualizarPresentacionProducto(payload);
        await mostrarExito(
          "Presentación actualizada",
          "La presentación del producto se actualizó correctamente."
        );
      } else {
        await insertarPresentacionProducto(payload);
        await mostrarExito(
          "Presentación guardada",
          "La presentación del producto se registró correctamente."
        );
      }

      setPresentacion(presentacionInicial);

      if (onPresentacionGuardada) {
        onPresentacionGuardada();
      }
    } catch (error) {
      await mostrarError(
        "Ocurrió un error",
        estaEditando
          ? "No se pudo actualizar la presentación del producto."
          : "No se pudo registrar la presentación del producto."
      );
      console.error(error);
    }
  };

  const manejarCancelar = () => {
    setPresentacion(presentacionInicial);

    if (onCancelarEdicion) {
      onCancelarEdicion();
    }
  };

  return (
    <div className="card">
      <div className="card__header">
        <h2 className="card__title">
          {estaEditando ? "Editar presentación" : "Agregar presentación"}
        </h2>
        <p className="card__subtitle">
          {estaEditando
            ? "Modifica la información de la presentación seleccionada."
            : "Completa los campos para registrar una nueva presentación de producto."}
        </p>
      </div>

      <div className="card__body">
        <form className="form" onSubmit={manejarSubmit}>
          <div className="form__grid">
            
            <div className="form__group">
              <label className="label" htmlFor="idProducto">Producto</label>
              <select
                id="idProducto"
                name="idProducto"
                value={presentacion.idProducto}
                onChange={manejarCambio}
                className="select"
                required
                disabled={cargandoCombos}
              >
                <option value="">Seleccione un producto</option>
                {productosDropdown.map((producto) => (
                  <option key={producto.idProducto} value={producto.idProducto}>
                    {producto.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form__group">
              <label className="label" htmlFor="descripcion">Descripción</label>
              <input
                id="descripcion"
                type="text"
                name="descripcion"
                placeholder="Ejemplo: Saco de 50 kg"
                value={presentacion.descripcion}
                onChange={manejarCambio}
                className="input"
                required
              />
            </div>

            <div className="form__group">
              <label className="label" htmlFor="cantidad">Cantidad</label>
              <input
                id="cantidad"
                type="number"
                name="cantidad"
                placeholder="Ejemplo: 50"
                value={presentacion.cantidad}
                onChange={manejarCambio}
                className="input"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form__group">
              <label className="label" htmlFor="idUnidadMedida">Unidad de medida</label>
              <select
                id="idUnidadMedida"
                name="idUnidadMedida"
                value={presentacion.idUnidadMedida}
                onChange={manejarCambio}
                className="select"
                required
                disabled={cargandoCombos}
              >
                <option value="">Seleccione una unidad</option>
                {unidadesDropdown.map((unidad) => (
                  <option key={unidad.idUnidadMedida} value={unidad.idUnidadMedida}>
                    {unidad.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form__group">
              <label className="label" htmlFor="cantidadNormalizada">Cantidad normalizada</label>
              <input
                id="cantidadNormalizada"
                type="number"
                name="cantidadNormalizada"
                placeholder="Ejemplo: 50"
                value={presentacion.cantidadNormalizada}
                onChange={manejarCambio}
                className="input"
                min="0"
                step="0.01"
                required
              />
            </div>

            {estaEditando && (
              <div className="form__group">
                <label className="label" htmlFor="activo">Estado</label>
                <select
                  id="activo"
                  name="activo"
                  value={presentacion.activo ? "true" : "false"}
                  onChange={(e) =>
                    setPresentacion((prev) => ({
                      ...prev,
                      activo: e.target.value === "true"
                    }))
                  }
                  className="select"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            )}
          </div>

          <div className="form__actions">
            {estaEditando && (
              <button
                type="button"
                className="btn btn--secondary btn--md"
                onClick={manejarCancelar}
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              className="btn btn--primary btn--md"
              disabled={cargandoCombos}
            >
              {estaEditando ? "Actualizar presentación" : "Guardar presentación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormularioPresentacionProducto;