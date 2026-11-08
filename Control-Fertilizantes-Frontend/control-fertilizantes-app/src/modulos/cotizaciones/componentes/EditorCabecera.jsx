import { useState } from "react";
import Campo from "../../../componentes/comunes/Campo.jsx";
import PendientesCabecera from "./PendientesCabecera.jsx";
import {
  camposCabecera, camposParte, confirmarNombresCabecera, cuerpoCabecera, partesCabecera,
  camposPendientesCabecera, requiereMotivoCabecera, valoresCabecera,
} from "../utils/formularioRespuesta.js";

const identificacion = ["numeroProforma", "fechaProforma", "fechaVencimiento", "moneda"];
const importes = ["subtotal", "total"];
const ajustes = ["descuento", "iva", "otrosCargos"];
const condiciones = ["condicionesPago", "diasCredito", "condicionesEntrega"];
const adicionales = ["vendedor", "observaciones"];
const sinCargo = (valor) => valor === "" || valor == null || /^0+(?:[.,]0*)?$/.test(String(valor));

export default function EditorCabecera({ cabecera, respuesta, solicitud, guardar, cerrar, ocupado }) {
  const [valores, setValores] = useState(() => valoresCabecera(cabecera));
  const [motivo, setMotivo] = useState("");
  const [mostrarAjustes, setMostrarAjustes] = useState(() =>
    ajustes.some((campo) => cabecera[campo] == null || !sinCargo(cabecera[campo])));
  const asignar = (campo) => (valor) => setValores((actual) => ({ ...actual, [campo]: valor }));
  const requiereMotivo = requiereMotivoCabecera(cabecera, valores, respuesta.estadoConciliacion);
  const cliente = solicitud.datosCliente?.nombre;
  const proveedor = respuesta.nombreProveedor;
  const faltanNombres = !String(valores.datosClienteOriginal.nombre ?? "").trim() ||
    !String(valores.datosProveedorOriginal.nombre ?? "").trim();
  const monedas = [...new Set(["CRC", "USD", valores.moneda].filter(Boolean))]
    .map((value) => ({ value, label: value === "CRC" ? "Colón costarricense (CRC)" : value === "USD" ? "Dólar estadounidense (USD)" : value }));

  function renderizarCampos(nombres) {
    return nombres.map((nombre) => {
      const [, etiqueta, maxLength, tipo] = camposCabecera.find(([campo]) => campo === nombre);
      return <Campo key={nombre} etiqueta={nombre === "moneda" ? "Moneda" : etiqueta}
        valor={valores[nombre]} cambiar={asignar(nombre)} maxLength={maxLength}
        opciones={nombre === "moneda" ? monedas : undefined}
        textoLargo={tipo === "largo"} type={tipo === "date" || tipo === "tel" ? tipo : "text"}
        formatoNumerico={tipo === "decimal" || tipo === "entero" ? tipo : undefined} />;
    });
  }

  return <form className="form" onSubmit={(evento) => {
    evento.preventDefault();
    guardar(() => ({ motivo: motivo.trim() || null, cabecera: cuerpoCabecera(valores) }));
  }}>
    <PendientesCabecera campos={camposPendientesCabecera(valores)} />
    <fieldset className="form" disabled={ocupado}>
      <legend>Datos de la oferta</legend>
      <div className="form-row">{renderizarCampos(identificacion)}</div>
      <p className="text-muted">La fecha y la moneda son necesarias para validar. Completa el número y el vencimiento si aparecen en el PDF.</p>
      <div className="form-row">{renderizarCampos(importes)}</div>
      <div className="form-actions">
        <button type="button" className="btn btn--secondary" aria-expanded={mostrarAjustes}
          onClick={() => setMostrarAjustes(!mostrarAjustes)}>
          {mostrarAjustes ? "Ocultar descuentos, impuestos y cargos" : "Ver descuentos, impuestos y cargos"}
        </button>
        {ajustes.every((campo) => sinCargo(valores[campo])) && ajustes.some((campo) => valores[campo] === "") &&
          <button type="button" className="btn btn--secondary" onClick={() => {
            setValores((actual) => ({ ...actual, descuento: "0", iva: "0", otrosCargos: "0" }));
            setMostrarAjustes(false);
          }}>Confirmar que no hay descuentos, IVA ni otros cargos</button>}
      </div>
      {mostrarAjustes && <div className="form-row form-row--3">{renderizarCampos(ajustes)}</div>}
    </fieldset>

    <fieldset className="form" disabled={ocupado}>
      <legend>Cliente y proveedor del documento</legend>
      <p>Cliente de la solicitud · {cliente || "Sin nombre registrado"}</p>
      <p>Proveedor seleccionado · {proveedor}</p>
      <p>Cliente en el PDF · {valores.datosClienteOriginal.nombre || "Pendiente de confirmar"}</p>
      <p>Proveedor en el PDF · {valores.datosProveedorOriginal.nombre || "Pendiente de confirmar"}</p>
      {faltanNombres && cliente && proveedor && <button type="button" className="btn btn--secondary"
        onClick={() => setValores((actual) => confirmarNombresCabecera(actual, cliente, proveedor))}>
        Confirmar que estos nombres coinciden con el PDF
      </button>}
      <details>
        <summary>Corregir los nombres del documento</summary>
        <div className="form-row">
          {partesCabecera.map(([parte, titulo]) => <Campo key={parte} etiqueta={titulo}
            valor={valores[parte].nombre ?? ""} maxLength={150}
            cambiar={(valor) => asignar(parte)({ ...valores[parte], nombre: valor })} />)}
        </div>
      </details>
      <details>
        <summary>Datos de contacto e identificación (opcional)</summary>
        {partesCabecera.map(([parte, titulo]) => <fieldset key={parte} className="form-row">
          <legend>{titulo}</legend>
          {camposParte.filter(([campo]) => campo !== "nombre").map(([campo, etiqueta, maxLength, tipo]) => <Campo key={campo}
            etiqueta={titulo + " · " + etiqueta} valor={valores[parte][campo]} maxLength={maxLength}
            type={tipo}
            cambiar={(valor) => asignar(parte)({ ...valores[parte], [campo]: valor })} />)}
        </fieldset>)}
      </details>
    </fieldset>

    <details>
      <summary>Condiciones de pago y entrega (opcional)</summary>
      <fieldset className="form-row" disabled={ocupado}>{renderizarCampos(condiciones)}</fieldset>
    </details>
    <details>
      <summary>Información adicional (opcional)</summary>
      <fieldset className="form-row" disabled={ocupado}>{renderizarCampos(adicionales)}</fieldset>
    </details>

    {requiereMotivo ? <Campo etiqueta="Motivo del ajuste de cabecera" valor={motivo} cambiar={setMotivo}
      maxLength={1000} required disabled={ocupado} /> : <details>
      <summary>Añadir una observación (opcional)</summary>
      <Campo etiqueta="Observación de la actualización (opcional)" valor={motivo} cambiar={setMotivo} maxLength={1000} disabled={ocupado} />
    </details>}
    <p className="text-muted">Al guardar se comprobarán los importes completos. Si hay una discrepancia, podrás corregirla o justificarla.</p>
    <div className="form-actions">
      <button type="button" className="btn btn--secondary" onClick={cerrar} disabled={ocupado}>Cancelar edición</button>
      <button className="btn btn--primary" disabled={ocupado}>Guardar cabecera</button>
    </div>
  </form>;
}
