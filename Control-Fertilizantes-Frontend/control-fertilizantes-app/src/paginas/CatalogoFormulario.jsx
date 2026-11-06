import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Campo from "../componentes/comunes/Campo.jsx";
import Pagina, { EstadoConsulta, Mensajes, Tarjeta } from "../componentes/comunes/Pagina.jsx";
import useConsulta from "../hooks/useConsulta.js";
import useOperacion from "../hooks/useOperacion.js";
import { campoIdCatalogo, guardarCatalogo, listarCatalogo, obtenerCatalogo, productosElegibles, unidadesElegibles } from "../api/catalogosApi.js";
import { cuerpoCatalogo, formulariosCatalogo, valoresCatalogo } from "../utils/formulariosCatalogo.js";
import { mismoId } from "../utils/datosApi.js";

function cargarOpciones(catalogo, signal) {
  if (catalogo === "productos") return productosElegibles(signal);
  if (catalogo === "unidades") return unidadesElegibles(signal);
  return listarCatalogo(catalogo, { soloActivos: true }, signal);
}

export default function CatalogoFormulario({ tipo }) {
  const { id } = useParams();
  const configuracion = formulariosCatalogo[tipo];
  const cargar = useCallback(async (signal) => {
    const catalogos = [...new Set(configuracion.campos.map((c) => c.catalogo).filter(Boolean))];
    const [original, opciones] = await Promise.all([
      id ? obtenerCatalogo(tipo, id, signal) : null,
      Promise.all(catalogos.map(async (catalogo) => [catalogo, await cargarOpciones(catalogo, signal)])),
    ]);
    return { original, opciones: Object.fromEntries(opciones) };
  }, [tipo, id, configuracion]);
  const estado = useConsulta(cargar);

  return <Pagina titulo={`${id ? "Editar" : "Registrar"}: ${configuracion.titulo}`}
    acciones={<Link to={configuracion.ruta} className="btn btn--secondary">Volver al listado</Link>}>
    <EstadoConsulta estado={estado}>
      {estado.datos && <EditorCatalogo key={`${tipo}-${id}`} tipo={tipo} id={id} {...estado.datos} />}
    </EstadoConsulta>
  </Pagina>;
}

function EditorCatalogo({ tipo, id, original, opciones }) {
  const navigate = useNavigate();
  const { campos, ruta } = formulariosCatalogo[tipo];
  const [valores, setValores] = useState(() => valoresCatalogo(tipo, original));
  const operacion = useOperacion();

  function guardar(evento) {
    evento.preventDefault();
    operacion.ejecutar(async () => {
      await guardarCatalogo(tipo, id, cuerpoCatalogo(tipo, valores));
      navigate(ruta);
    });
  }

  return <Tarjeta>
    <form className="form" onSubmit={guardar}>
      <fieldset className="form-row" disabled={operacion.ocupado}>
        {campos.map(({ nombre, catalogo, opciones: fijas, escala, ...campo }) => {
          const valor = valores[nombre];
          const lista = catalogo ? opciones[catalogo].map((item) => ({
            value: item[campoIdCatalogo(catalogo)],
            label: [item.nombre, item.marca, item.codigo ?? item.codigoInterno].filter(Boolean).join(" · "),
          })) : fijas?.map((value) => ({ value, label: value }));
          if (lista && catalogo && valor && !lista.some((item) => mismoId(item.value, valor))) {
            lista.push({ value: valor, label: `Opción anterior #${valor} (no disponible)`, disabled: true });
          }
          return <Campo key={nombre} {...campo} opciones={lista} valor={valor}
            cambiar={(nuevo) => setValores((actual) => ({ ...actual, [nombre]: nuevo }))}
            {...(escala ? { inputMode: "decimal" } : {})} />;
        })}
      </fieldset>
      {tipo === "presentaciones" && <p>SQL calcula el contenido normalizado a partir de la unidad seleccionada.</p>}
      <Mensajes {...operacion} />
      <div className="form-actions">
        <Link className="btn btn--secondary" to={ruta}>Cancelar</Link>
        <button type="submit" className="btn btn--primary" disabled={operacion.ocupado}>Guardar</button>
      </div>
    </form>
  </Tarjeta>;
}
