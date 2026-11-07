import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import Campo from "../../../componentes/comunes/Campo.jsx";
import { EstadoConsulta, Mensajes, Tarjeta } from "../../../componentes/comunes/Pagina.jsx";
import useConsulta from "../../../hooks/useConsulta.js";
import useOperacion from "../../../hooks/useOperacion.js";
import { consultarImputacion, imputarCompra, revertirImputacion } from "../api/presupuestosApi.js";
import useIdOperacion from "../hooks/useIdOperacion.js";
import { fechaCorta, monedaVisible, motivoValido, nuevaImputacion, prepararImputacion } from "../utils/presupuesto.js";
import DistribucionPresupuesto from "./DistribucionPresupuesto.jsx";

export function CamposImputacion({ compra, datos, cambiar, ocupado }) {
  const { idProducto, idPresentacionProducto, idProveedor, fechaCompra, moneda, precioTotal } = compra;
  if (!idProducto || !idPresentacionProducto || !idProveedor || !fechaCompra || !moneda) {
    return <p>Completa el producto, presentación, proveedor, fecha y moneda de la compra para ver las partidas disponibles.</p>;
  }
  const asignar = (campo) => (valor) => cambiar({ ...datos, [campo]: valor });

  return <>
    <p className="text-muted">Distribuye el importe total de la compra ({monedaVisible(precioTotal, moneda)}). Si ya existe un compromiso, puedes utilizar su saldo.</p>
    <DistribucionPresupuesto filas={datos.filas} cambiar={asignar("filas")} fecha={fechaCorta(fechaCompra)}
      moneda={moneda} idProducto={idProducto} idPresentacionProducto={idPresentacionProducto} idProveedor={idProveedor} ocupado={ocupado} />
    <div className="form-row form-row--3">
      <Campo etiqueta="Motivo de la imputación" valor={datos.motivo} cambiar={asignar("motivo")} maxLength={500} required disabled={ocupado} />
      <Campo etiqueta="Justificación del exceso (si aplica)" valor={datos.motivoExceso}
        cambiar={asignar("motivoExceso")} maxLength={500} disabled={ocupado} />
    </div>
  </>;
}

export default function ImputacionCompra({ compra }) {
  const id = compra.idCompra;
  const cargar = useCallback((signal) => consultarImputacion(id, signal), [id]);
  const estado = useConsulta(cargar);
  const operacion = useOperacion();
  const { conOperacion, completarOperacion } = useIdOperacion();
  const [datos, setDatos] = useState(null);
  const [reversion, setReversion] = useState(null);

  return <Tarjeta titulo="Imputación presupuestaria">
    <Mensajes {...operacion} />
    <EstadoConsulta estado={estado}>
      {estado.datos?.length ? <>
        <div className="table-wrapper"><table className="table">
          <thead><tr><th>Presupuesto</th><th>Finca</th><th>Rubro</th><th>Importe ejecutado</th></tr></thead>
          <tbody>{estado.datos.map((r) => <tr key={`${r.idPresupuesto}-${r.rubro}`}>
            <td><Link to={`/presupuestos/${r.idPresupuesto}`}>{r.presupuesto}</Link></td><td>{r.finca ?? "General"}</td>
            <td>{r.rubro}</td><td>{monedaVisible(r.monto, compra.moneda)}</td>
          </tr>)}</tbody>
        </table></div>
        {estado.datos.some((r) => r.estado === "Cerrado") ? <p>La distribución pertenece a un presupuesto cerrado.</p> :
          reversion === null ? <button type="button" className="btn btn--secondary" onClick={() => setReversion("")}>Revertir distribución</button> :
            <form className="form" onSubmit={(e) => {
              e.preventDefault();
              operacion.ejecutar(async () => {
                await revertirImputacion(id, conOperacion({ motivo: motivoValido(reversion) }, "revertir"));
                completarOperacion();
                setReversion(null);
                estado.recargar();
              }, "Distribución revertida.");
            }}>
              <Campo etiqueta="Motivo de la reversión" valor={reversion} cambiar={setReversion} maxLength={500} required disabled={operacion.ocupado} />
              <div className="form-actions">
                <button type="button" className="btn btn--secondary" disabled={operacion.ocupado} onClick={() => setReversion(null)}>Cancelar</button>
                <button className="btn btn--primary" disabled={operacion.ocupado}>Confirmar reversión</button>
              </div>
            </form>}
      </> : datos ? <form className="form" onSubmit={(e) => {
        e.preventDefault();
        operacion.ejecutar(async () => {
          await imputarCompra(id, conOperacion(prepararImputacion(datos, compra.precioTotal), "imputar"));
          completarOperacion();
          setDatos(null);
          estado.recargar();
        }, "Compra imputada al presupuesto.");
      }}>
        <CamposImputacion compra={compra} datos={datos} cambiar={setDatos} ocupado={operacion.ocupado} />
        <div className="form-actions">
          <button type="button" className="btn btn--secondary" disabled={operacion.ocupado} onClick={() => setDatos(null)}>Cancelar</button>
          <button className="btn btn--primary" disabled={operacion.ocupado}>Guardar distribución</button>
        </div>
      </form> : <>
        <p>Esta compra aún no tiene distribución presupuestaria.</p>
        <button type="button" className="btn btn--secondary" onClick={() => setDatos(nuevaImputacion())}>Imputar a presupuesto</button>
      </>}
    </EstadoConsulta>
  </Tarjeta>;
}
