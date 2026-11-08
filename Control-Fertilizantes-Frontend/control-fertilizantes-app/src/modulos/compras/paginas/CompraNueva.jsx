import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Pagina, { EstadoConsulta, Mensajes, Tarjeta } from "../../../componentes/comunes/Pagina.jsx";
import useConsulta from "../../../hooks/useConsulta.js";
import useOperacion from "../../../hooks/useOperacion.js";
import { fechaLocal } from "../../../utils/datosApi.js";
import { monedaVisible } from "../../presupuestos/utils/presupuesto.js";
import useIdOperacion from "../../presupuestos/hooks/useIdOperacion.js";
import CabeceraCompra from "../componentes/CabeceraCompra.jsx";
import RenglonCompra from "../componentes/RenglonCompra.jsx";
import { catalogosCompra, prepararDocumentoCompra, totalDocumentoCompra, valoresRenglon } from "../utils/documentoCompra.js";
import { registrarDocumentoCompra } from "../api/comprasDocumentoApi.js";

export default function CompraNueva() {
  const estado = useConsulta(catalogosCompra);
  return <Pagina titulo="Nueva compra" descripcion="Registra todos los productos de una misma compra."
    acciones={<Link className="btn btn--secondary" to="/compras">Volver al listado</Link>}>
    <EstadoConsulta estado={estado}>{estado.datos && <Formulario catalogos={estado.datos} />}</EstadoConsulta>
  </Pagina>;
}

function Formulario({ catalogos }) {
  const [cabecera, setCabecera] = useState({ idProveedor: "", fechaCompra: fechaLocal(), moneda: "CRC", numeroFactura: "", observaciones: "" });
  const [lineas, setLineas] = useState(() => [valoresRenglon()]);
  const operacion = useOperacion();
  const { conOperacion } = useIdOperacion();
  const navigate = useNavigate();
  const total = totalDocumentoCompra(lineas);

  return <form className="form" onSubmit={(evento) => {
    evento.preventDefault();
    operacion.ejecutar(async () => {
      const compra = await registrarDocumentoCompra(conOperacion(prepararDocumentoCompra(cabecera, lineas)));
      navigate(`/compras/${compra.idCompraCabecera}`);
    });
  }}>
    <Tarjeta titulo="Datos generales">
      <p className="text-muted">El número de compra se asigna automáticamente. Estos datos se aplican a todos los productos.</p>
      <fieldset className="form" disabled={operacion.ocupado}><CabeceraCompra datos={cabecera} cambiar={setCabecera} catalogos={catalogos} /></fieldset>
    </Tarjeta>
    <Tarjeta titulo="Productos de la compra">
      <p className="text-muted">Indica el importe final de cada renglón, incluidos los ajustes que le correspondan.</p>
      {lineas.map((linea, indice) => <div className="form" key={linea.clave}>
        <RenglonCompra linea={linea} numero={indice + 1} cabecera={cabecera} catalogos={catalogos} ocupado={operacion.ocupado} permitirImputacion
          cambiar={(nueva) => setLineas((actuales) => actuales.map((l) => l.clave === linea.clave ? nueva : l))} />
        {lineas.length > 1 && <button type="button" className="btn btn--secondary btn--sm" disabled={operacion.ocupado}
          onClick={() => setLineas((actuales) => actuales.filter((l) => l.clave !== linea.clave))}>Quitar renglón {indice + 1}</button>}
      </div>)}
      <button type="button" className="btn btn--secondary" disabled={operacion.ocupado || lineas.length >= 100}
        onClick={() => setLineas((actuales) => [...actuales, valoresRenglon()])}>Agregar producto</button>
    </Tarjeta>
    <Tarjeta titulo="Total de la compra">
      <p>{lineas.length} {lineas.length === 1 ? "renglón" : "renglones"} · <strong>{total === null ? "Completa los importes para calcular el total" : monedaVisible(total, cabecera.moneda)}</strong></p>
      <Mensajes {...operacion} />
      <button className="btn btn--primary" disabled={operacion.ocupado}>Guardar compra</button>
    </Tarjeta>
  </form>;
}
