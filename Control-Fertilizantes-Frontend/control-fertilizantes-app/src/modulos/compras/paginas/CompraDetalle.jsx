import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Pagina, { EstadoConsulta, Mensajes, Tarjeta } from "../../../componentes/comunes/Pagina.jsx";
import useConsulta from "../../../hooks/useConsulta.js";
import useOperacion from "../../../hooks/useOperacion.js";
import { formatearNumero } from "../../../utils/numeros.js";
import { fechaCorta, monedaVisible } from "../../presupuestos/utils/presupuesto.js";
import ImputacionCompra from "../../presupuestos/componentes/ImputacionCompra.jsx";
import CabeceraCompra from "../componentes/CabeceraCompra.jsx";
import RenglonCompra from "../componentes/RenglonCompra.jsx";
import { catalogosCompra, cuerpoCabeceraCompra, cuerpoRenglonCompra, valoresRenglon } from "../utils/documentoCompra.js";
import { actualizarCabeceraCompra, actualizarRenglonCompra, obtenerDocumentoCompra } from "../api/comprasDocumentoApi.js";

export default function CompraDetalle() {
  const { id } = useParams();
  const cargar = useCallback((signal) => obtenerDocumentoCompra(id, signal), [id]);
  const estado = useConsulta(cargar);
  return <Pagina titulo={estado.datos?.numeroCompra ?? "Detalle de compra"}
    acciones={<Link className="btn btn--secondary" to="/compras">Volver al listado</Link>}>
    <EstadoConsulta estado={estado}>{estado.datos && <Detalle key={id} compra={estado.datos} actualizar={estado.actualizar} />}</EstadoConsulta>
  </Pagina>;
}

function Detalle({ compra, actualizar }) {
  const [edicion, setEdicion] = useState(null);
  return <>
    <Tarjeta titulo="Datos generales">
      <p>{compra.nombreProveedor} · {fechaCorta(compra.fechaCompra)} · {compra.moneda}</p>
      <p>Factura: {compra.numeroFactura || "Sin número registrado"}</p>
      {compra.observaciones && <p>{compra.observaciones}</p>}
      <p>{compra.cantidadProductos} renglones · Total <strong>{monedaVisible(compra.total, compra.moneda)}</strong></p>
      {edicion === "cabecera" ? <EditorCabecera key={compra.version} compra={compra} actualizar={actualizar} cerrar={() => setEdicion(null)} />
        : <button type="button" className="btn btn--secondary" disabled={edicion !== null} onClick={() => setEdicion("cabecera")}>Editar datos generales</button>}
    </Tarjeta>
    {compra.lineas.map((linea) => <Producto key={linea.idCompra} linea={linea} compra={compra} actualizar={actualizar} edicion={edicion} setEdicion={setEdicion} />)}
  </>;
}

function EditorCabecera({ compra, actualizar, cerrar }) {
  const [datos, setDatos] = useState(compra);
  const catalogos = useConsulta(catalogosCompra);
  const operacion = useOperacion();
  return <EstadoConsulta estado={catalogos}>{catalogos.datos && <form className="form" onSubmit={(e) => {
    e.preventDefault();
    operacion.ejecutar(async () => {
      actualizar(await actualizarCabeceraCompra(compra.idCompraCabecera, { ...cuerpoCabeceraCompra(datos), version: compra.version }));
      cerrar();
    });
  }}>
    <fieldset className="form" disabled={operacion.ocupado}><CabeceraCompra datos={datos} cambiar={setDatos} catalogos={catalogos.datos} /></fieldset>
    <Mensajes {...operacion} />
    <div className="form-actions"><button type="button" className="btn btn--secondary" disabled={operacion.ocupado} onClick={cerrar}>Cancelar edición</button>
      <button className="btn btn--primary" disabled={operacion.ocupado}>Guardar datos generales</button></div>
  </form>}</EstadoConsulta>;
}

function Producto({ linea, compra, actualizar, edicion, setEdicion }) {
  const editar = edicion === String(linea.idCompra);
  const [presupuesto, setPresupuesto] = useState(false);
  return <Tarjeta titulo={`${linea.numeroLinea}. ${linea.nombreProducto}${linea.marca ? ` · ${linea.marca}` : ""}`}>
    <p>{linea.presentacion} · {formatearNumero(linea.cantidadPresentacion)} {linea.unidadMedida}</p>
    <p>{formatearNumero(linea.cantidadComprada)} empaques · Por empaque {monedaVisible(linea.precioUnitarioCalculado, compra.moneda)} · Importe <strong>{monedaVisible(linea.precioTotal, compra.moneda)}</strong></p>
    {linea.observaciones && <p>{linea.observaciones}</p>}
    {editar ? <EditorRenglon key={compra.version} linea={linea} compra={compra} actualizar={actualizar} cerrar={() => setEdicion(null)} />
      : <button type="button" className="btn btn--secondary" disabled={edicion !== null} onClick={() => setEdicion(String(linea.idCompra))}>Editar renglón {linea.numeroLinea}</button>}
    <details onToggle={(e) => setPresupuesto(e.currentTarget.open)}>
      <summary>Distribución presupuestaria del renglón {linea.numeroLinea}</summary>
      {presupuesto && <ImputacionCompra compra={{ ...compra, ...linea }} />}
    </details>
  </Tarjeta>;
}

function EditorRenglon({ linea, compra, actualizar, cerrar }) {
  const [datos, setDatos] = useState(() => ({ ...linea, ...valoresRenglon(linea) }));
  const catalogos = useConsulta(catalogosCompra);
  const operacion = useOperacion();
  return <EstadoConsulta estado={catalogos}>{catalogos.datos && <form className="form" onSubmit={(e) => {
    e.preventDefault();
    operacion.ejecutar(async () => {
      actualizar(await actualizarRenglonCompra(compra.idCompraCabecera, linea.idCompra, { ...cuerpoRenglonCompra(datos), version: compra.version }));
      cerrar();
    });
  }}>
    <RenglonCompra linea={datos} numero={linea.numeroLinea} cabecera={compra} catalogos={catalogos.datos} cambiar={setDatos} ocupado={operacion.ocupado} />
    <Mensajes {...operacion} />
    <div className="form-actions"><button type="button" className="btn btn--secondary" disabled={operacion.ocupado} onClick={cerrar}>Cancelar edición</button>
      <button className="btn btn--primary" disabled={operacion.ocupado}>Guardar renglón</button></div>
  </form>}</EstadoConsulta>;
}
