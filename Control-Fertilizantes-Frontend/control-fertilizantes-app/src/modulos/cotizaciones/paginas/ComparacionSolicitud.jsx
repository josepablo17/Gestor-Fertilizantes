import { formatearNumero } from "../../../utils/numeros.js";
import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Campo from "../../../componentes/comunes/Campo.jsx";
import MatrizOfertas from "../componentes/MatrizOfertas.jsx";
import ReservaDesdeCotizacion from "../../presupuestos/componentes/ReservaDesdeCotizacion.jsx";
import Pagina, { EstadoConsulta, Tarjeta } from "../../../componentes/comunes/Pagina.jsx";
import useConsulta from "../../../hooks/useConsulta.js";
import { compararSolicitud, obtenerSolicitud } from "../api/cotizacionesApi.js";
import { basesImporte } from "../utils/formularioRespuesta.js";
import { fechaLocal, mostrarDato } from "../../../utils/datosApi.js";

const dimensiones = [
  { value: "PESO", label: "Peso (kg)" },
  { value: "VOLUMEN", label: "Volumen (litros)" },
  { value: "UNIDAD", label: "Unidades" },
];

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
      <form className="form comparacion-filtros" onSubmit={(e) => {
        e.preventDefault();
        setFiltros({ ...valores, moneda: valores.moneda.trim().toUpperCase() });
      }}>
        <div className="form-row form-row--3">
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
  return <>
    <MatrizOfertas resultado={resultado} />
    <ReservaDesdeCotizacion key={JSON.stringify(resultado.criterio)} resultado={resultado} />
    <Tarjeta titulo="Ajustes globales por proforma">
      {resultado.documentos.length === 0 ? <p>No hay proformas validadas en estos resultados.</p> : <div className="table-wrapper">
        <table className="table"><thead><tr><th>Proforma</th><th>Moneda</th><th>Vence</th><th>Descuento</th><th>IVA</th>
          <th>Otros cargos o transporte</th><th>Total</th><th>Conciliación</th><th>Condiciones</th></tr></thead>
          <tbody>{resultado.documentos.map((doc) => <tr key={doc.idProformaProveedor}>
            <td><Link to={`/respuestas/${doc.idProformaProveedor}`}>{doc.numeroProforma || `#${doc.idProformaProveedor}`}</Link> · v{doc.versionRespuesta}</td>
            <td>{mostrarDato(doc.moneda)}</td><td>{mostrarDato(doc.fechaVencimiento)}</td>
            <td>{formatearNumero(doc.ajustesGlobales.descuento)}</td><td>{formatearNumero(doc.ajustesGlobales.iva)}</td>
            <td>{formatearNumero(doc.ajustesGlobales.otrosCargos)}</td><td>{formatearNumero(doc.totalDocumento)}</td>
            <td>{mostrarDato(doc.estadoConciliacion)}{doc.justificacionConciliacion && <p>{doc.justificacionConciliacion}</p>}</td>
            <td>Pago: {mostrarDato(doc.condicionesPago)}<br />Entrega: {mostrarDato(doc.condicionesEntrega)}</td>
          </tr>)}</tbody>
        </table>
      </div>}
    </Tarjeta>
  </>;
}
