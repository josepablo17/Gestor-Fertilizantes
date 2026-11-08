import Campo from "../../../componentes/comunes/Campo.jsx";
import { useState } from "react";
import CompraInformacionReferencia from "../../../componentes/compras/CompraInformacionReferencia.jsx";
import { CamposImputacion } from "../../presupuestos/componentes/ImputacionCompra.jsx";
import { nuevaImputacion } from "../../presupuestos/utils/presupuesto.js";
import { criteriosImputacionCompra, opcionesPresentacion } from "../utils/documentoCompra.js";

export default function RenglonCompra({ linea, numero, cabecera, catalogos, cambiar, ocupado, permitirImputacion = false }) {
  const [referencia, setReferencia] = useState(false);
  const asignar = (campo) => (valor) => cambiar({ ...linea, [campo]: valor });
  const productos = catalogos.productos.map((p) => ({ value: p.idProducto, label: [p.nombre, p.marca].filter(Boolean).join(" · ") }));
  if (linea.idProducto && !productos.some((p) => String(p.value) === String(linea.idProducto)))
    productos.push({ value: linea.idProducto, label: linea.nombreProducto || "Producto anterior (inactivo)", disabled: true });
  const presentaciones = opcionesPresentacion(catalogos, linea.idProducto);
  if (linea.idPresentacionProducto && !presentaciones.some((p) => String(p.value) === String(linea.idPresentacionProducto)))
    presentaciones.push({ value: linea.idPresentacionProducto, label: linea.presentacion || "Presentación anterior (inactiva)", disabled: true });
  const criterios = criteriosImputacionCompra(cabecera, linea);
  const imputacion = linea.imputacion;
  const vigente = imputacion?.criterios === criterios;
  const compra = { ...cabecera, ...linea };

  return <fieldset className="form" disabled={ocupado}>
    <legend>Renglón {numero}</legend>
    <div className="form-row">
      <Campo etiqueta={`Producto del renglón ${numero}`} valor={linea.idProducto} opciones={productos} required
        cambiar={(valor) => cambiar({ ...linea, idProducto: valor, idPresentacionProducto: "" })} />
      <Campo etiqueta={`Presentación del renglón ${numero}`} valor={linea.idPresentacionProducto} opciones={presentaciones} required cambiar={asignar("idPresentacionProducto")} />
      <Campo etiqueta={`Empaques del renglón ${numero}`} valor={linea.cantidadComprada} formatoNumerico="entero" required cambiar={asignar("cantidadComprada")} />
      <Campo etiqueta={`Importe del renglón ${numero}`} valor={linea.precioTotal} formatoNumerico="decimal" required cambiar={asignar("precioTotal")} />
    </div>
    <details><summary>Observación del renglón (opcional)</summary>
      <Campo etiqueta={`Observación del renglón ${numero}`} valor={linea.observaciones} cambiar={asignar("observaciones")} maxLength={500} textoLargo />
    </details>
    <details onToggle={(e) => setReferencia(e.currentTarget.open)}><summary>Consultar precio anterior</summary>{referencia && <CompraInformacionReferencia compra={compra} />}</details>
    {permitirImputacion && <>
      <Campo etiqueta={`Imputar el renglón ${numero} a presupuesto`} casilla valor={Boolean(imputacion)}
        cambiar={(activar) => asignar("imputacion")(activar ? { criterios, datos: nuevaImputacion() } : null)} />
      {imputacion && (vigente ? <CamposImputacion compra={compra} datos={imputacion.datos} ocupado={ocupado}
        cambiar={(datos) => asignar("imputacion")({ criterios, datos })} /> : <div>
        <p>Cambiaron los datos de este renglón o de la cabecera. Revisa su distribución.</p>
        <button type="button" className="btn btn--secondary" onClick={() => asignar("imputacion")({ criterios, datos: nuevaImputacion() })}>Reiniciar distribución del renglón {numero}</button>
      </div>)}
    </>}
  </fieldset>;
}
