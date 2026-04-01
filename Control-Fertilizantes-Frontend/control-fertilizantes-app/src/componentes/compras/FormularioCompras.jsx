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
    <div className="card-modulo">
      <div className="titulo-seccion">
        <h2>{estaEditando ? "Editar Compra" : "Registrar Compra"}</h2>
        <p>
          {estaEditando
            ? "Modifica la información de la compra seleccionada."
            : "Completa los campos para registrar una nueva compra."}
        </p>
      </div>

      <form className="formulario-modulo" onSubmit={manejarSubmit}>
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

        <div className="acciones-formulario">
          {estaEditando && (
            <button
              type="button"
              className="boton-base boton-secundario"
              onClick={manejarCancelar}
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            className="boton-base boton-primario"
            disabled={cargandoCatalogos}
          >
            {estaEditando ? "Actualizar compra" : "Guardar compra"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormularioCompra;