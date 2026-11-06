import EntradaNumerica from "../comunes/EntradaNumerica.jsx";
import { formatearNumero } from "../../utils/numeros.js";

function CompraCamposFormulario({
  compra,
  productos,
  proveedores,
  presentacionesFiltradas,
  cargandoCatalogos,
  onChange
}) {
  return (
    <div className="form__grid">
      
      {/* Producto */}
      <div className="form__group">
        <label htmlFor="idProducto" className="label">Producto</label>
        <select
          id="idProducto"
          name="idProducto"
          value={compra.idProducto}
          onChange={onChange}
          required
          disabled={cargandoCatalogos}
          className="select select--md"
        >
          <option value="">Seleccione un producto</option>
          {productos.map((producto) => (
            <option key={producto.idProducto} value={producto.idProducto}>
              {producto.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Proveedor */}
      <div className="form__group">
        <label htmlFor="idProveedor" className="label">Proveedor</label>
        <select
          id="idProveedor"
          name="idProveedor"
          value={compra.idProveedor}
          onChange={onChange}
          required
          disabled={cargandoCatalogos}
          className="select select--md"
        >
          <option value="">Seleccione un proveedor</option>
          {proveedores.map((proveedor) => (
            <option key={proveedor.idProveedor} value={proveedor.idProveedor}>
              {proveedor.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Presentación */}
      <div className="form__group">
        <label htmlFor="idPresentacionProducto" className="label">Presentación</label>
        <select
          id="idPresentacionProducto"
          name="idPresentacionProducto"
          value={compra.idPresentacionProducto}
          onChange={onChange}
          required
          disabled={cargandoCatalogos}
          className="select select--md"
        >
          <option value="">Seleccione una presentación</option>
          {presentacionesFiltradas.map((presentacion) => (
            <option
              key={presentacion.idPresentacionProducto}
              value={presentacion.idPresentacionProducto}
            >
              {(presentacion.descripcion ||
                presentacion.presentacion ||
                "Presentación")}{" "}
              - {formatearNumero(presentacion.cantidad)}{" "}
              {presentacion.unidadMedida || ""}
            </option>
          ))}
        </select>
      </div>

      {/* Fecha */}
      <div className="form__group">
        <label htmlFor="fechaCompra" className="label">Fecha de compra</label>
        <input
          id="fechaCompra"
          type="date"
          name="fechaCompra"
          value={compra.fechaCompra}
          onChange={onChange}
          required
          className="input input--md"
        />
      </div>

      {/* Cantidad */}
      <div className="form__group">
        <label htmlFor="cantidadComprada" className="label">Cantidad comprada</label>
        <EntradaNumerica
          id="cantidadComprada"
          formato="entero"
          name="cantidadComprada"
          placeholder="Ej: 10"
          title="Indica la cantidad de empaques completos, sin decimales."
          value={compra.cantidadComprada}
          onChange={onChange}
          required
          className="input input--md"
        />
      </div>

      {/* Precio */}
      <div className="form__group">
        <label htmlFor="precioTotal" className="label">Precio total</label>
        <EntradaNumerica
          id="precioTotal"
          formato="decimal"
          name="precioTotal"
          placeholder="Ej: 25000"
          value={compra.precioTotal}
          onChange={onChange}
          required
          className="input input--md"
        />
      </div>

      {/* Moneda */}
      <div className="form__group">
        <label htmlFor="moneda" className="label">Moneda</label>
        <select
          id="moneda"
          name="moneda"
          value={compra.moneda}
          onChange={onChange}
          required
          className="select select--md"
        >
          <option value="">Seleccione una moneda</option>
          <option value="CRC">CRC</option>
          <option value="USD">USD</option>
        </select>
      </div>

      {/* Observaciones */}
      <div className="form__group form__group--full">
        <label htmlFor="observaciones" className="label">Observaciones</label>
        <textarea
          id="observaciones"
          name="observaciones"
          placeholder="Agrega observaciones sobre la compra..."
          value={compra.observaciones}
          onChange={onChange}
          rows="4"
          maxLength="500"
          className="textarea"
        />
      </div>

    </div>
  );
}

export default CompraCamposFormulario;
