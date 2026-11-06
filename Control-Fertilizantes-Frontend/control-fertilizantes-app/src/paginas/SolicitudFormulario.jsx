import { useCallback, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Campo from "../componentes/comunes/Campo.jsx";
import Pagina, { EstadoConsulta, Mensajes, Tarjeta } from "../componentes/comunes/Pagina.jsx";
import useConsulta from "../hooks/useConsulta.js";
import useOperacion from "../hooks/useOperacion.js";
import { cargarCatalogoCotizacion, etiquetaPresentacion } from "../api/catalogosApi.js";
import { guardarSolicitud, obtenerSolicitud } from "../api/cotizacionesApi.js";
import { camposCliente, cuerpoSolicitud, nuevaLineaSolicitud, valoresSolicitud } from "../utils/formularioSolicitud.js";
import { mismoId } from "../utils/datosApi.js";

export default function SolicitudFormulario() {
  const { id } = useParams();
  const volver = id ? `/solicitudes/${id}` : "/solicitudes";
  const cargar = useCallback(async (signal) => {
    const [original, catalogo] = await Promise.all([id ? obtenerSolicitud(id, signal) : null, cargarCatalogoCotizacion(signal)]);
    return { original, catalogo };
  }, [id]);
  const estado = useConsulta(cargar);
  return <Pagina titulo={id ? "Editar borrador" : "Nueva solicitud"}
    acciones={<Link className="btn btn--secondary" to={volver}>Volver</Link>}>
    <EstadoConsulta estado={estado}>
      {estado.datos && (estado.datos.original && estado.datos.original.estado !== "Borrador"
        ? <p>Solo se puede editar una solicitud en borrador.</p>
        : <EditorSolicitud key={id ?? "nueva"} id={id} volver={volver} {...estado.datos} />)}
    </EstadoConsulta>
  </Pagina>;
}

function EditorSolicitud({ id, volver, original, catalogo }) {
  const [valores, setValores] = useState(() => valoresSolicitud(original));
  const secuencia = useRef(0);
  const navigate = useNavigate();
  const operacion = useOperacion();
  const asignar = (campo) => (valor) => setValores((actual) => ({ ...actual, [campo]: valor }));
  const cambiarLinea = (clave, cambios) => setValores((actual) => ({
    ...actual, lineas: actual.lineas.map((l) => l.clave === clave ? { ...l, ...cambios } : l),
  }));
  const productos = catalogo.productos.map((p) => ({
    value: p.idProducto, label: [p.nombre, p.marca, p.codigoInterno].filter(Boolean).join(" · "),
  }));
  const proveedores = [
    ...catalogo.proveedores,
    ...(original?.destinatarios ?? []).filter((d) => !catalogo.proveedores.some((p) => mismoId(p.idProveedor, d.idProveedor)))
      .map((d) => ({ idProveedor: d.idProveedor, nombre: `${d.nombreProveedor} (no disponible)` })),
  ];

  function agregar() {
    secuencia.current += 1;
    asignar("lineas")([...valores.lineas, nuevaLineaSolicitud(`nueva-${secuencia.current}`)]);
  }

  function guardar(e) {
    e.preventDefault();
    operacion.ejecutar(async () => {
      const guardada = await guardarSolicitud(id, cuerpoSolicitud(valores));
      navigate(`/solicitudes/${guardada.idSolicitudCotizacion}`);
    });
  }

  return <form className="form" onSubmit={guardar}>
    <Tarjeta titulo="Datos de la solicitud">
      <fieldset className="form-row" disabled={operacion.ocupado}>
        <Campo etiqueta="Número de solicitud" valor={valores.numeroSolicitud} cambiar={asignar("numeroSolicitud")} required maxLength={50} />
        <Campo etiqueta="Fecha de solicitud" valor={valores.fechaSolicitud} cambiar={asignar("fechaSolicitud")} type="date" required />
        <Campo etiqueta="Fecha límite de respuesta" valor={valores.fechaLimiteRespuesta} cambiar={asignar("fechaLimiteRespuesta")} type="date" min={valores.fechaSolicitud} />
        <Campo etiqueta="Observaciones de la solicitud" valor={valores.observaciones} cambiar={asignar("observaciones")} textoLargo maxLength={2000} />
      </fieldset>
    </Tarjeta>
    <Tarjeta titulo="Cliente">
      <fieldset className="form-row" disabled={operacion.ocupado}>
        {camposCliente.map(([campo, etiqueta, maxLength, type]) => <Campo key={campo} etiqueta={etiqueta}
          valor={valores.cliente[campo]} cambiar={(valor) => asignar("cliente")({ ...valores.cliente, [campo]: valor })} maxLength={maxLength} type={type} />)}
      </fieldset>
    </Tarjeta>
    <Tarjeta titulo="Renglones solicitados">
      {productos.length === 0 && <p>Registra un producto activo y una presentación antes de agregar renglones.</p>}
      {valores.lineas.map((linea, i) => {
        const opcionesProducto = [...productos];
        if (linea.idProducto && !productos.some((p) => mismoId(p.value, linea.idProducto))) {
          opcionesProducto.push({ value: linea.idProducto, label: `${linea.etiquetaProducto ?? "Producto anterior"} (no disponible)`, disabled: true });
        }
        const opcionesPresentacion = catalogo.presentaciones.filter((p) => mismoId(p.idProducto, linea.idProducto))
          .map((p) => ({ value: p.idPresentacionProducto, label: etiquetaPresentacion(p) }));
        if (linea.idPresentacionProducto && !opcionesPresentacion.some((p) => mismoId(p.value, linea.idPresentacionProducto))) {
          opcionesPresentacion.push({ value: linea.idPresentacionProducto, label: `${linea.etiquetaPresentacion ?? "Presentación anterior"} (no disponible)`, disabled: true });
        }
        return <fieldset key={linea.clave} className="form-row" disabled={operacion.ocupado}>
          <legend>Renglón {i + 1}</legend>
          <Campo etiqueta={`Producto del renglón ${i + 1}`} valor={linea.idProducto} opciones={opcionesProducto} required
            cambiar={(valor) => cambiarLinea(linea.clave, { idProducto: valor, idPresentacionProducto: "" })} />
          <Campo etiqueta={`Presentación del renglón ${i + 1}`} valor={linea.idPresentacionProducto} opciones={opcionesPresentacion} required
            cambiar={(valor) => cambiarLinea(linea.clave, { idPresentacionProducto: valor })} />
          <Campo etiqueta={`Empaques solicitados del renglón ${i + 1}`} valor={linea.cantidadEmpaques} inputMode="decimal" required
            cambiar={(valor) => cambiarLinea(linea.clave, { cantidadEmpaques: valor })} />
          <Campo etiqueta={`Permitir alternativas en renglón ${i + 1}`} valor={linea.permiteAlternativas} casilla
            cambiar={(valor) => cambiarLinea(linea.clave, { permiteAlternativas: valor })} />
          <Campo etiqueta={`Observaciones del renglón ${i + 1}`} valor={linea.observaciones} maxLength={1000}
            cambiar={(valor) => cambiarLinea(linea.clave, { observaciones: valor })} />
          <button type="button" className="btn btn--secondary"
            onClick={() => asignar("lineas")(valores.lineas.filter((l) => l.clave !== linea.clave))}>Quitar renglón {i + 1}</button>
        </fieldset>;
      })}
      <button type="button" className="btn btn--secondary" disabled={operacion.ocupado || productos.length === 0 || valores.lineas.length >= 100}
        onClick={agregar}>Agregar renglón</button>
    </Tarjeta>
    <Tarjeta titulo="Proveedores destinatarios">
      {proveedores.length === 0 && <p>No hay proveedores activos.</p>}
      <fieldset className="form-row" disabled={operacion.ocupado}>
        {proveedores.map((p) => {
          const seleccionado = valores.proveedores.some((proveedor) => mismoId(proveedor, p.idProveedor));
          return <Campo key={p.idProveedor} etiqueta={p.nombre} valor={seleccionado} casilla
            disabled={!seleccionado && valores.proveedores.length >= 50}
            cambiar={(seleccionar) => asignar("proveedores")(seleccionar
              ? [...valores.proveedores, p.idProveedor] : valores.proveedores.filter((proveedor) => !mismoId(proveedor, p.idProveedor)))} />;
        })}
      </fieldset>
    </Tarjeta>
    <Mensajes {...operacion} />
    <div className="form-actions"><Link className="btn btn--secondary" to={volver}>Cancelar</Link>
      <button className="btn btn--primary" disabled={operacion.ocupado}>Guardar borrador</button></div>
  </form>;
}
