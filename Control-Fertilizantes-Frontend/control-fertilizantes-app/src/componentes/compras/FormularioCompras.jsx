import useFormularioCompra from "../../hooks/useCompraFormulario";
import CompraCamposFormulario from "./CompraCamposFormulario";
import CompraInformacionReferencia from "./CompraInformacionReferencia";

function FormularioCompra({
  onCompraGuardada,
  compraEditar,
  onCancelarEdicion
}) {
  const {
    compra,
    productos,
    proveedores,
    presentacionesFiltradas,
    cargandoCatalogos,
    ultimoPrecio,
    cargandoUltimoPrecio,
    estaEditando,
    manejarCambio,
    manejarSubmit,
    manejarCancelar
  } = useFormularioCompra({
    compraEditar,
    onCompraGuardada,
    onCancelarEdicion
  });

  const formatearMonto = (monto, moneda) => {
    if (monto === null || monto === undefined || monto === "") {
      return "No disponible";
    }

    return `${moneda || ""} ${Number(monto).toFixed(2)}`.trim();
  };

 return (
  <>
    <div className="page-section__header">
      <div>
        <h2 className="page-section__title">
          {estaEditando ? "Editar compra" : "Registrar compra"}
        </h2>
        <p className="page-section__subtitle">
          {estaEditando
            ? "Modifica la información de la compra seleccionada."
            : "Completa los campos para registrar una nueva compra."}
        </p>
      </div>
    </div>

    <form className="form" onSubmit={manejarSubmit}>
      <CompraCamposFormulario
        compra={compra}
        productos={productos}
        proveedores={proveedores}
        presentacionesFiltradas={presentacionesFiltradas}
        cargandoCatalogos={cargandoCatalogos}
        onChange={manejarCambio}
      />

      <CompraInformacionReferencia
        ultimoPrecio={ultimoPrecio}
        cargandoUltimoPrecio={cargandoUltimoPrecio}
        estaEditando={estaEditando}
        compraEditar={compraEditar}
        formatearMonto={formatearMonto}
      />

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

        <button
          type="submit"
          className="btn btn--primary"
          disabled={cargandoCatalogos}
        >
          {estaEditando ? "Actualizar compra" : "Guardar compra"}
        </button>
      </div>
    </form>
  </>
);
}

export default FormularioCompra;