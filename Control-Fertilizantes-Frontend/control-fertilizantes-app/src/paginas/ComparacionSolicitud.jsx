import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Campo from "../componentes/comunes/Campo.jsx";
import Pagina, { EstadoConsulta, Tarjeta } from "../componentes/comunes/Pagina.jsx";
import useConsulta from "../hooks/useConsulta.js";
import { compararSolicitud, obtenerSolicitud } from "../api/cotizacionesApi.js";
import { basesImporte } from "../utils/formularioRespuesta.js";
import { fechaLocal, mostrarDato } from "../utils/datosApi.js";

const dimensiones = [
  { value: "PESO", label: "Peso (kg)" },
  { value: "VOLUMEN", label: "Volumen (litros)" },
  { value: "UNIDAD", label: "Unidades" },
];

const condiciones = {
  Comparable: "Comparable",
  SinRespuestaValidada: "Sin respuesta validada",
  LineaSinCotizar: "Renglón sin cotizar",
  SinCotizar: "Sin cotizar",
  NoDisponible: "No disponible",
  MonedaDistinta: "Moneda distinta",
  BasePrecioDistinta: "Base de precio distinta",
  DimensionDistinta: "Dimensión distinta",
  AlternativaNoIncluida: "Alternativa excluida por filtro",
  EquivalenciaNoRevisada: "Equivalencia sin revisar",
  PrecioNoRepresentable: "Precio no representable",
};

export default function ComparacionSolicitud() {
  const { id } = useParams();
  const cargar = useCallback((signal) => obtenerSolicitud(id, signal), [id]);
  const estado = useConsulta(cargar);
  return <Pagina titulo={estado.datos ? `Comparación de ${estado.datos.numeroSolicitud}` : "Comparación de ofertas"}
    acciones={<Link to={`/solicitudes/${id}`} className="btn btn--secondary">Volver a la solicitud</Link>}>
    <EstadoConsulta estado={estado}>
      {estado.datos && <Comparador key={id} id={id} solicitud={estado.datos} />}
    </EstadoConsulta>
  </Pagina>;
}

function Comparador({ id, solicitud }) {
  const [valores, setValores] = useState(() => ({
    moneda: "CRC", baseTotalLinea: "", fechaReferencia: fechaLocal(),
    tipoBase: "", idSolicitudCotizacionDetalle: "", incluirAlternativas: true,
  }));
  const [filtros, setFiltros] = useState(null);
  const cargar = useCallback((signal) => filtros ? compararSolicitud(id, filtros, signal) : Promise.resolve(null), [id, filtros]);
  const estado = useConsulta(cargar);
  const asignar = (campo) => (valor) => setValores((actual) => ({ ...actual, [campo]: valor }));
  const resultado = estado.datos;

  return <>
    <Tarjeta titulo="Criterios de comparación">
      <form className="form" onSubmit={(e) => {
        e.preventDefault();
        setFiltros({ ...valores, moneda: valores.moneda.trim().toUpperCase() });
      }}>
        <div className="form-row">
          <Campo etiqueta="Moneda de comparación" valor={valores.moneda} cambiar={asignar("moneda")} maxLength={3}
            pattern="[A-Za-z]{3}" required />
          <Campo etiqueta="Base de precio" valor={valores.baseTotalLinea} cambiar={asignar("baseTotalLinea")} opciones={basesImporte} required />
          <Campo etiqueta="Fecha para comprobar vigencia" valor={valores.fechaReferencia} cambiar={asignar("fechaReferencia")} type="date" required />
          <Campo etiqueta="Dimensión (opcional)" valor={valores.tipoBase} cambiar={asignar("tipoBase")} opciones={dimensiones} />
          <Campo etiqueta="Renglón (opcional)" valor={valores.idSolicitudCotizacionDetalle} cambiar={asignar("idSolicitudCotizacionDetalle")}
            opciones={solicitud.lineas.map((l) => ({ value: l.idSolicitudCotizacionDetalle, label: `${l.numeroLinea}. ${l.nombreProductoOriginal}` }))} />
          <Campo etiqueta="Incluir alternativas" valor={valores.incluirAlternativas} cambiar={asignar("incluirAlternativas")} casilla />
        </div>
        <div className="form-actions">
          <button className="btn btn--primary" disabled={Boolean(filtros) && estado.cargando}>Comparar</button>
        </div>
      </form>
    </Tarjeta>
    {filtros && <EstadoConsulta estado={estado}>
      {resultado && <ResultadoComparacion resultado={resultado} />}
    </EstadoConsulta>}
  </>;
}

function ResultadoComparacion({ resultado }) {
  const documentos = new Map(resultado.documentos.map((doc) => [doc.idProformaProveedor, doc]));
  const precio = (valor, unidad) => valor == null ? "—" : `${resultado.criterio.moneda} ${valor}/${unidad}`;

  return <>
    <Tarjeta titulo="Resultado">
      <p>{resultado.criterio.moneda} · {basesImporte.find((base) => base.value === resultado.criterio.baseTotalLinea)?.label} · Vigencia al {resultado.criterio.fechaReferencia}</p>
      {resultado.lineas.length === 0 && <p>No hay renglones para estos filtros.</p>}
    </Tarjeta>
    {resultado.lineas.map((linea) => <Tarjeta key={linea.idSolicitudCotizacionDetalle}
      titulo={`${linea.numeroLinea}. ${linea.productoSolicitado}${linea.marcaSolicitada ? ` · ${linea.marcaSolicitada}` : ""}`}>
      <p>{linea.presentacionSolicitada} · Solicitado: {linea.cantidadEmpaquesSolicitada} empaques · {linea.contenidoTotalSolicitado} {linea.unidadBase}</p>
      <p>Menor precio: {precio(linea.menorPrecioPorUnidadBase, linea.unidadBase)} · Menor con cobertura y vigencia: {precio(linea.menorPrecioConCoberturaYVigencia, linea.unidadBase)}</p>
      <div className="table-wrapper">
        <table className="table"><thead><tr><th>Proveedor</th><th>Oferta</th><th>Cantidad ofrecida</th><th>Precio por empaque</th>
          <th>Total de línea</th><th>Precio por {linea.unidadBase}</th><th>Cubre lo pedido</th><th>Vigencia</th><th>Resultado</th></tr></thead>
          <tbody>{linea.ofertas.map((oferta) => {
            const doc = documentos.get(oferta.idProformaProveedor);
            return <tr key={`${oferta.idSolicitudCotizacionProveedor}-${oferta.idProformaProveedorDetalle ?? "sin-linea"}`}>
              <td>{oferta.nombreProveedorActual}{doc && <p><Link to={`/respuestas/${doc.idProformaProveedor}`}>Ver proforma {doc.numeroProforma ?? doc.idProformaProveedor}</Link></p>}</td>
              <td>{[oferta.productoOfrecido, oferta.marcaOfrecida, oferta.presentacionOfrecida].filter(Boolean).join(" · ") || "—"}
                {oferta.tipoOferta === "Alternativa" && <p>Alternativa{oferta.motivoAlternativa && ` · ${oferta.motivoAlternativa}`}</p>}</td>
              <td>{oferta.contenidoTotalOfrecido == null ? "—" : `${oferta.contenidoTotalOfrecido} ${oferta.unidadBaseOfrecida ?? ""} (${oferta.cantidadEmpaquesOfrecida} empaques)`}</td>
              <td>{oferta.precioPorEmpaque == null ? "—" : `${doc?.moneda ?? ""} ${oferta.precioPorEmpaque}`}</td>
              <td>{oferta.totalLinea == null ? "—" : `${doc?.moneda ?? ""} ${oferta.totalLinea} · ${oferta.baseTotalLinea ?? ""}`}</td>
              <td>{precio(oferta.precioPorUnidadBase, linea.unidadBase)}</td>
              <td>{oferta.estadoOferta === "Cotizada" ? oferta.cubreCantidadSolicitada ? "Sí" : "No" : "—"}</td>
              <td>{oferta.vigente === true ? "Vigente" : oferta.vigente === false ? "Vencida" : "Sin fecha conocida"}</td>
              <td>{condiciones[oferta.condicionComparacion] ?? oferta.condicionComparacion}
                {oferta.esMenorPrecioUnitario && <p><strong>Menor precio</strong></p>}
                {oferta.esMenorPrecioConCoberturaYVigencia && <p><strong>Menor con cobertura y vigencia</strong></p>}</td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </Tarjeta>)}
    <Tarjeta titulo="Ajustes globales por proforma">
      {resultado.documentos.length === 0 ? <p>No hay proformas validadas en estos resultados.</p> : <div className="table-wrapper">
        <table className="table"><thead><tr><th>Proforma</th><th>Moneda</th><th>Vence</th><th>Descuento</th><th>IVA</th>
          <th>Otros cargos o transporte</th><th>Total</th><th>Conciliación</th><th>Condiciones</th></tr></thead>
          <tbody>{resultado.documentos.map((doc) => <tr key={doc.idProformaProveedor}>
            <td><Link to={`/respuestas/${doc.idProformaProveedor}`}>{doc.numeroProforma || `#${doc.idProformaProveedor}`}</Link> · v{doc.versionRespuesta}</td>
            <td>{mostrarDato(doc.moneda)}</td><td>{mostrarDato(doc.fechaVencimiento)}</td>
            <td>{mostrarDato(doc.ajustesGlobales.descuento)}</td><td>{mostrarDato(doc.ajustesGlobales.iva)}</td>
            <td>{mostrarDato(doc.ajustesGlobales.otrosCargos)}</td><td>{mostrarDato(doc.totalDocumento)}</td>
            <td>{mostrarDato(doc.estadoConciliacion)}{doc.justificacionConciliacion && <p>{doc.justificacionConciliacion}</p>}</td>
            <td>Pago: {mostrarDato(doc.condicionesPago)}<br />Entrega: {mostrarDato(doc.condicionesEntrega)}</td>
          </tr>)}</tbody>
        </table>
      </div>}
    </Tarjeta>
  </>;
}
