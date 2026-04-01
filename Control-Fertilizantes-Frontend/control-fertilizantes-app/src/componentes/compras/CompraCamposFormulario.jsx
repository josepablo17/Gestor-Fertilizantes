function CompraCamposFormulario({
  compra,
  productos,
  proveedores,
  presentacionesFiltradas,
  cargandoCatalogos,
  onChange
}) {
  return (
    <>
      <div className="campo-formulario">
        <label htmlFor="idProducto">Producto</label>
        <select
          id="idProducto"
          name="idProducto"
          value={compra.idProducto}
          onChange={onChange}
          required
          disabled={cargandoCatalogos}
        >
          <option value="">Seleccione un producto</option>
          {productos.map((producto) => (
            <option key={producto.idProducto} value={producto.idProducto}>
              {producto.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="campo-formulario">
        <label htmlFor="idProveedor">Proveedor</label>
        <select
          id="idProveedor"
          name="idProveedor"
          value={compra.idProveedor}
          onChange={onChange}
          required
          disabled={cargandoCatalogos}
        >
          <option value="">Seleccione un proveedor</option>
          {proveedores.map((proveedor) => (
            <option key={proveedor.idProveedor} value={proveedor.idProveedor}>
              {proveedor.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="campo-formulario">
        <label htmlFor="idPresentacionProducto">Presentación</label>
        <select
          id="idPresentacionProducto"
          name="idPresentacionProducto"
          value={compra.idPresentacionProducto}
          onChange={onChange}
          required
          disabled={cargandoCatalogos}
        >
          <option value="">Seleccione una presentación</option>
          {presentacionesFiltradas.map((presentacion) => (
            <option
              key={presentacion.idPresentacionProducto}
              value={presentacion.idPresentacionProducto}
            >
              {presentacion.descripcion ||
                presentacion.presentacion ||
                "Presentación"}{" "}
              - {presentacion.cantidad || 0}{" "}
              {presentacion.unidadMedida || ""}
            </option>
          ))}
        </select>
      </div>

      <div className="campo-formulario">
        <label htmlFor="fechaCompra">Fecha de compra</label>
        <input
          id="fechaCompra"
          type="date"
          name="fechaCompra"
          value={compra.fechaCompra}
          onChange={onChange}
          required
        />
      </div>

      <div className="campo-formulario">
        <label htmlFor="cantidadComprada">Cantidad comprada</label>
        <input
          id="cantidadComprada"
          type="number"
          name="cantidadComprada"
          placeholder="Ejemplo: 10"
          value={compra.cantidadComprada}
          onChange={onChange}
          min="0"
          step="0.01"
          required
        />
      </div>

      <div className="campo-formulario">
        <label htmlFor="precioTotal">Precio total</label>
        <input
          id="precioTotal"
          type="number"
          name="precioTotal"
          placeholder="Ejemplo: 25000"
          value={compra.precioTotal}
          onChange={onChange}
          min="0"
          step="0.01"
          required
        />
      </div>

      <div className="campo-formulario">
        <label htmlFor="moneda">Moneda</label>
        <select
          id="moneda"
          name="moneda"
          value={compra.moneda}
          onChange={onChange}
          required
        >
          <option value="">Seleccione una moneda</option>
          <option value="CRC">CRC</option>
          <option value="USD">USD</option>
        </select>
      </div>

      <div className="campo-formulario campo-formulario-completo">
        <label htmlFor="observaciones">Observaciones</label>
        <textarea
          id="observaciones"
          name="observaciones"
          placeholder="Agrega observaciones sobre la compra..."
          value={compra.observaciones}
          onChange={onChange}
          rows="4"
          maxLength="500"
        />
      </div>
    </>
  );
}

export default CompraCamposFormulario;