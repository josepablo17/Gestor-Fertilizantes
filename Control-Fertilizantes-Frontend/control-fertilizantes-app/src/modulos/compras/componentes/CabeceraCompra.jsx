import Campo from "../../../componentes/comunes/Campo.jsx";
import { monedas } from "../../presupuestos/utils/presupuesto.js";

export default function CabeceraCompra({ datos, cambiar, catalogos }) {
  const asignar = (campo) => (valor) => cambiar({ ...datos, [campo]: valor });
  const proveedores = catalogos.proveedores.map((p) => ({ value: p.idProveedor, label: p.nombre }));
  if (datos.idProveedor && !proveedores.some((p) => String(p.value) === String(datos.idProveedor)))
    proveedores.push({ value: datos.idProveedor, label: datos.nombreProveedor || "Proveedor anterior (inactivo)", disabled: true });

  return <>
    <div className="form-row form-row--3">
      <Campo etiqueta="Proveedor" valor={datos.idProveedor} cambiar={asignar("idProveedor")} opciones={proveedores} required />
      <Campo etiqueta="Fecha de compra" type="date" valor={datos.fechaCompra?.slice(0, 10)} cambiar={asignar("fechaCompra")} required />
      <Campo etiqueta="Moneda" valor={datos.moneda} cambiar={asignar("moneda")} opciones={monedas} required />
    </div>
    <div className="form-row">
      <Campo etiqueta="Número de factura (opcional)" valor={datos.numeroFactura} cambiar={asignar("numeroFactura")} maxLength={100} />
      <Campo etiqueta="Observaciones de la compra (opcional)" valor={datos.observaciones} cambiar={asignar("observaciones")} textoLargo maxLength={500} />
    </div>
  </>;
}
