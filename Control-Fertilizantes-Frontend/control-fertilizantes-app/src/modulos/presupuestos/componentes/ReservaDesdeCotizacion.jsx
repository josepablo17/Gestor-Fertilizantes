import { useState } from "react";
import { Link } from "react-router-dom";
import Campo from "../../../componentes/comunes/Campo.jsx";
import { Mensajes, Tarjeta } from "../../../componentes/comunes/Pagina.jsx";
import useOperacion from "../../../hooks/useOperacion.js";
import { idRuta } from "../../../utils/datosApi.js";
import { registrarCompromiso } from "../api/presupuestosApi.js";
import useIdOperacion from "../hooks/useIdOperacion.js";
import { filaDistribucion, importePositivo, monedaVisible, motivoValido } from "../utils/presupuesto.js";
import DistribucionPresupuesto from "./DistribucionPresupuesto.jsx";

export default function ReservaDesdeCotizacion({ resultado }) {
  const [abierta, setAbierta] = useState(false);
  const [fecha, setFecha] = useState(resultado.criterio.fechaReferencia);
  const [filas, setFilas] = useState(() => [filaDistribucion()]);
  const [motivo, setMotivo] = useState("");
  const [registro, setRegistro] = useState(null);
  const operacion = useOperacion();
  const { conOperacion, completarOperacion } = useIdOperacion();
  const { moneda } = resultado.criterio;
  if (!["CRC", "USD"].includes(moneda)) return null;
  const documentos = new Map(resultado.documentos.map((d) => [String(d.idSolicitudCotizacionProveedor), d]));
  const ofertas = resultado.lineas.flatMap((linea) => linea.ofertas.flatMap((o) => {
    const doc = documentos.get(String(o.idSolicitudCotizacionProveedor));
    return o.condicionComparacion === "Comparable" && o.idProformaProveedorDetalle && doc?.moneda === moneda &&
      doc.fechaProforma && doc.fechaVencimiento && fecha >= doc.fechaProforma && fecha <= doc.fechaVencimiento
      ? [{ value: o.idProformaProveedorDetalle, label: `${linea.numeroLinea}. ${o.productoOfrecido || linea.productoSolicitado} · ${o.nombreProveedorActual} · línea ${monedaVisible(o.totalLinea, moneda)}` }]
      : [];
  }));

  return <Tarjeta titulo="Reservar presupuesto">
    {registro && <p role="status">Compromiso #{registro} registrado. <Link to="/presupuestos">Ver presupuestos</Link></p>}
    {!abierta ? <button type="button" className="btn btn--secondary" onClick={() => setAbierta(true)}>
      Preparar compromiso
    </button> : <form className="form" onSubmit={(e) => {
      e.preventDefault();
      operacion.ejecutar(async () => {
        const distribucion = filas.map((f) => ({
          idPartidaPresupuesto: idRuta(f.idPartidaPresupuesto), monto: importePositivo(f.monto),
          idProformaProveedorDetalle: idRuta(f.idProformaProveedorDetalle),
        }));
        if (distribucion.some((f) => !ofertas.some((o) => String(o.value) === f.idProformaProveedorDetalle))) {
          throw new Error("Selecciona ofertas vigentes para la fecha indicada.");
        }
        const id = await registrarCompromiso(conOperacion({
          fechaCompromiso: fecha, moneda, idSolicitudCotizacion: resultado.idSolicitudCotizacion,
          motivo: motivoValido(motivo), distribucion,
        }));
        completarOperacion();
        setRegistro(id);
        setFilas([filaDistribucion()]);
        setMotivo("");
        setAbierta(false);
      });
    }}>
      <p className="text-muted">Confirma cuánto reservar por partida en {moneda}. Incluye los descuentos, impuestos o cargos globales que correspondan.</p>
      <div className="form-row form-row--3">
        <Campo etiqueta="Fecha del compromiso" valor={fecha} cambiar={(valor) => { setFecha(valor); setFilas([filaDistribucion()]); }}
          type="date" required disabled={operacion.ocupado} />
        <Campo etiqueta="Motivo de la reserva" valor={motivo} cambiar={setMotivo} maxLength={500} required disabled={operacion.ocupado} />
      </div>
      {ofertas.length ? <DistribucionPresupuesto filas={filas} cambiar={setFilas} fecha={fecha}
        moneda={moneda} ofertas={ofertas} ocupado={operacion.ocupado} /> :
        <p>No hay ofertas comparables vigentes en esta fecha.</p>}
      <div className="form-actions">
        <button type="button" className="btn btn--secondary" disabled={operacion.ocupado} onClick={() => setAbierta(false)}>Volver</button>
        <button className="btn btn--primary" disabled={operacion.ocupado || !ofertas.length}>Registrar compromiso</button>
      </div>
      <Mensajes {...operacion} />
    </form>}
  </Tarjeta>;
}
