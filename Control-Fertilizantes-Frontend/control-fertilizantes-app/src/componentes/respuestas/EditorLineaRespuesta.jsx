import { useCallback, useState } from "react";
import Campo from "../comunes/Campo.jsx";
import { EstadoConsulta } from "../comunes/Pagina.jsx";
import { etiquetaPresentacion, listarCatalogo, productosElegibles } from "../../api/catalogosApi.js";
import useConsulta from "../../hooks/useConsulta.js";
import { basesImporte, cuerpoLinea, importesLinea, valoresLinea } from "../../utils/formularioRespuesta.js";
import { mismoId } from "../../utils/datosApi.js";

const tipoOfertas = [
  { value: "Solicitada", label: "Solicitada (misma presentación)" },
  { value: "Alternativa", label: "Alternativa" },
  { value: "Adicional", label: "Adicional" },
];
const estadosOferta = [
  { value: "Cotizada", label: "Cotizada" },
  { value: "NoDisponible", label: "No disponible" },
  { value: "SinCotizar", label: "Sin cotizar" },
];

export default function EditorLineaRespuesta({ linea, solicitud, guardar, cerrar, ocupado }) {
  const [valores, setValores] = useState(() => valoresLinea(linea));
  const [motivo, setMotivo] = useState("");
  const cotizada = valores.estadoOferta === "Cotizada";
  const adicional = valores.tipoOferta === "Adicional";
  const alternativa = valores.tipoOferta === "Alternativa";
  const buscaPresentacion = cotizada && (adicional || alternativa);
  const cargar = useCallback(async (signal) => {
    if (!buscaPresentacion) return [];
    const [productos, presentaciones] = await Promise.all([
      productosElegibles(signal), listarCatalogo("presentaciones", { soloActivos: true }, signal),
    ]);
    const ids = new Set(productos.map((producto) => producto.idProducto));
    return presentaciones.filter((p) => ids.has(p.idProducto));
  }, [buscaPresentacion]);
  const estado = useConsulta(cargar);

  const asignar = (campo) => (valor) => setValores((actual) => ({ ...actual, [campo]: valor }));
  const renglones = solicitud.lineas.map((l) => ({
    value: l.idSolicitudCotizacionDetalle,
    label: `${l.numeroLinea}. ${l.nombreProductoOriginal} · ${l.presentacionOriginal}`,
    disabled: alternativa && !l.permiteAlternativas,
  }));
  const presentaciones = (estado.datos ?? []).map((p) => ({
    value: p.idPresentacionProducto,
    label: [p.nombreProducto, p.marca, etiquetaPresentacion(p)].filter(Boolean).join(" · "),
  }));
  if (valores.idPresentacionProducto && !presentaciones.some((p) => mismoId(p.value, valores.idPresentacionProducto))) {
    presentaciones.push({ value: valores.idPresentacionProducto, label: "Presentación anterior (no disponible)", disabled: true });
  }

  return <form className="form" onSubmit={(e) => {
    e.preventDefault();
    guardar(() => ({ motivo: motivo.trim(), linea: cuerpoLinea(valores) }));
  }}>
    <fieldset className="form-row" disabled={ocupado}>
      <Campo etiqueta="Tipo de oferta" valor={valores.tipoOferta} opciones={tipoOfertas} required
        cambiar={(valor) => setValores((actual) => ({ ...actual, tipoOferta: valor,
          idSolicitudDetalle: valor === "Adicional" ? "" : actual.idSolicitudDetalle,
          idPresentacionProducto: actual.tipoOferta === "Solicitada" ? "" : actual.idPresentacionProducto,
        }))} />
      <Campo etiqueta="Estado de la oferta" valor={valores.estadoOferta} opciones={estadosOferta} required cambiar={asignar("estadoOferta")} />
      {!adicional && <Campo etiqueta="Renglón solicitado" valor={valores.idSolicitudDetalle} opciones={renglones}
        required cambiar={asignar("idSolicitudDetalle")} />}
      <Campo etiqueta="Número de renglón del PDF" valor={valores.numeroLinea} type="number" min={1} step={1} cambiar={asignar("numeroLinea")} />
      <Campo etiqueta="Código del proveedor" valor={valores.codigo} maxLength={100} cambiar={asignar("codigo")} />
      <Campo etiqueta="Descripción en el PDF" valor={valores.descripcion} maxLength={500} cambiar={asignar("descripcion")} />
      {alternativa && <Campo etiqueta="Motivo de la alternativa" valor={valores.motivoAlternativa} required maxLength={1000} cambiar={asignar("motivoAlternativa")} />}
      {buscaPresentacion && <EstadoConsulta estado={estado}>
        <Campo etiqueta="Presentación ofrecida" valor={valores.idPresentacionProducto} opciones={presentaciones}
          cambiar={asignar("idPresentacionProducto")} />
      </EstadoConsulta>}
      {cotizada && <>
        <Campo etiqueta="Base del total de línea" valor={valores.baseTotalLinea} required cambiar={asignar("baseTotalLinea")}
          opciones={[{ value: "SinDefinir", label: "Pendiente de definir" }, ...basesImporte]} />
        {importesLinea.map(([campo, etiqueta]) => <Campo key={campo} etiqueta={etiqueta} valor={valores[campo]}
          inputMode="decimal" cambiar={asignar(campo)} />)}
      </>}
      <Campo etiqueta="Observación del renglón" valor={valores.observacion} maxLength={1000} textoLargo cambiar={asignar("observacion")} />
      <Campo etiqueta="Motivo del ajuste de renglón" valor={motivo} cambiar={setMotivo} maxLength={1000} required />
    </fieldset>
    <div className="form-actions">
      <button type="button" className="btn btn--secondary" onClick={cerrar} disabled={ocupado}>Cancelar edición</button>
      <button className="btn btn--primary" disabled={ocupado}>Guardar renglón</button>
    </div>
  </form>;
}
