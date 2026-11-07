import { useState } from "react";
import useFormularioCompra from "../../hooks/useCompraFormulario";
import CompraCamposFormulario from "./CompraCamposFormulario";
import CompraInformacionReferencia from "./CompraInformacionReferencia";
import Campo from "../comunes/Campo.jsx";
import { CamposImputacion } from "../../modulos/presupuestos/componentes/ImputacionCompra.jsx";
import useIdOperacion from "../../modulos/presupuestos/hooks/useIdOperacion.js";
import { nuevaImputacion, prepararImputacion } from "../../modulos/presupuestos/utils/presupuesto.js";

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
    guardando,
    estaEditando,
    manejarCambio,
    manejarSubmit,
    manejarCancelar
  } = useFormularioCompra({
    compraEditar,
    onCompraGuardada,
    onCancelarEdicion
  });
  const [imputacion, setImputacion] = useState(null);
  const { conOperacion } = useIdOperacion();
  const criterios = JSON.stringify([compra.idProducto, compra.idPresentacionProducto, compra.idProveedor, compra.fechaCompra, compra.moneda]);
  const puedeConservar = imputacion && (imputacion.criterios === criterios ||
    imputacion.datos.filas.every((fila) => !fila.idPartidaPresupuesto));
  const datosImputacion = puedeConservar ? imputacion.datos : null;

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

    <form className="form" onSubmit={(e) => manejarSubmit(e, imputacion
      ? (payload) => {
        if (!datosImputacion) throw new Error("Revisa la distribución para los datos actuales de la compra.");
        return conOperacion(prepararImputacion(datosImputacion, compra.precioTotal), JSON.stringify(payload));
      }
      : null)}>
      <fieldset className="form presupuesto-distribucion" disabled={guardando}>
      <CompraCamposFormulario
        compra={compra}
        productos={productos}
        proveedores={proveedores}
        presentacionesFiltradas={presentacionesFiltradas}
        cargandoCatalogos={cargandoCatalogos}
        onChange={manejarCambio}
      />

      <CompraInformacionReferencia compra={compra} />
      {!estaEditando && <>
        <Campo etiqueta="Imputar esta compra a presupuesto" casilla valor={Boolean(imputacion)}
          cambiar={(activar) => setImputacion(activar ? { criterios, datos: nuevaImputacion() } : null)} />
        {datosImputacion && <CamposImputacion compra={compra} datos={datosImputacion}
          cambiar={(datos) => setImputacion({ criterios, datos })} ocupado={guardando} />}
        {imputacion && !datosImputacion && <div>
          <p>Cambiaron los datos de la compra. Vuelve a distribuir su importe.</p>
          <button type="button" className="btn btn--secondary"
            onClick={() => setImputacion({ criterios, datos: nuevaImputacion() })}>Reiniciar distribución</button>
        </div>}
      </>}
      </fieldset>

      <div className="form-actions">
        {estaEditando && (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={manejarCancelar}
            disabled={guardando}
          >
            Cancelar
          </button>
        )}

        <button
          type="submit"
          className="btn btn--primary"
          disabled={cargandoCatalogos || guardando || Boolean(imputacion && !datosImputacion)}
        >
          {estaEditando ? "Actualizar compra" : "Guardar compra"}
        </button>
      </div>
    </form>
  </>
);
}

export default FormularioCompra;
