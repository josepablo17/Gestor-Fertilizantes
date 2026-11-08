import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import Campo from "../../../componentes/comunes/Campo.jsx";
import { EstadoConsulta, EstadoVacio } from "../../../componentes/comunes/Pagina.jsx";
import Paginador from "../../../componentes/comunes/Paginador.jsx";
import useConsulta from "../../../hooks/useConsulta.js";
import { fechaCorta, monedas, monedaVisible } from "../../presupuestos/utils/presupuesto.js";
import { listarDocumentosCompra } from "../api/comprasDocumentoApi.js";

const iniciales = { busqueda: "", moneda: "", fecha: "" };

export default function ListaDocumentosCompra() {
  const [valores, setValores] = useState(iniciales);
  const [filtros, setFiltros] = useState(iniciales);
  const [pagina, setPagina] = useState(1);
  const cargar = useCallback((signal) => listarDocumentosCompra({ ...filtros, pagina, tamanoPagina: 20 }, signal), [filtros, pagina]);
  const estado = useConsulta(cargar);
  const asignar = (campo) => (valor) => setValores((actual) => ({ ...actual, [campo]: valor }));

  return <>
    <form className="form" onSubmit={(e) => { e.preventDefault(); setPagina(1); setFiltros({ ...valores }); }}>
      <div className="form-row form-row--3">
        <Campo etiqueta="Buscar compras" placeholder="Producto, proveedor, factura o número de compra" valor={valores.busqueda} cambiar={asignar("busqueda")} maxLength={150} />
        <Campo etiqueta="Filtrar por moneda" valor={valores.moneda} cambiar={asignar("moneda")} opciones={monedas} />
        <Campo etiqueta="Filtrar por fecha" type="date" valor={valores.fecha} cambiar={asignar("fecha")} />
      </div>
      <div className="form-actions"><button className="btn btn--primary">Buscar</button>
        <button type="button" className="btn btn--secondary" onClick={() => { setValores(iniciales); setFiltros(iniciales); setPagina(1); }}>Limpiar filtros</button></div>
    </form>
    <EstadoConsulta estado={estado}>{estado.datos && <>
      <p>{estado.datos.totalRegistros} compras encontradas</p>
      {estado.datos.elementos.length === 0 ? <EstadoVacio mensaje="No hay compras para estos filtros." /> : <div className="table-wrapper">
        <table className="table"><thead><tr><th>Compra</th><th>Proveedor</th><th>Fecha</th><th>Factura</th><th>Renglones</th><th>Total</th><th>Acciones</th></tr></thead>
          <tbody>{estado.datos.elementos.map((c) => <tr key={c.idCompraCabecera}>
            <td>{c.numeroCompra}</td><td>{c.nombreProveedor}</td><td>{fechaCorta(c.fechaCompra)}</td><td>{c.numeroFactura || "—"}</td>
            <td>{c.cantidadProductos}</td><td>{monedaVisible(c.total, c.moneda)}</td>
            <td><Link className="btn btn--primary btn--sm" aria-label={`Abrir compra ${c.numeroCompra}`} to={`/compras/${c.idCompraCabecera}`}>Abrir</Link></td>
          </tr>)}</tbody>
        </table>
      </div>}
      <Paginador paginaActual={pagina} totalPaginas={Math.ceil(estado.datos.totalRegistros / 20)} irAPagina={setPagina} etiqueta="Paginación de compras" />
    </>}</EstadoConsulta>
  </>;
}
