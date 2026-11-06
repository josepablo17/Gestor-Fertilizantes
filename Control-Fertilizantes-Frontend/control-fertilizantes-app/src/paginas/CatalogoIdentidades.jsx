import { useCallback } from "react";
import { Link } from "react-router-dom";
import Pagina, { EstadoConsulta, Mensajes, Tarjeta } from "../componentes/comunes/Pagina.jsx";
import { cambiarActivoCatalogo, campoIdCatalogo, listarCatalogo } from "../api/catalogosApi.js";
import useConsulta from "../hooks/useConsulta.js";
import useOperacion from "../hooks/useOperacion.js";
import { formulariosCatalogo } from "../utils/formulariosCatalogo.js";
import { mostrarConfirmacion } from "../utils/alertas.js";

export default function CatalogoIdentidades({ tipo }) {
  const esBase = tipo === "productosBase";
  const { ruta } = formulariosCatalogo[tipo];
  const cargar = useCallback((signal) => listarCatalogo(tipo, {}, signal), [tipo]);
  const estado = useConsulta(cargar);
  const operacion = useOperacion();

  async function cambiar(item) {
    const id = item[campoIdCatalogo(tipo)];
    if (item.activo && !(await mostrarConfirmacion("Desactivar registro", `¿Desactivar ${item.nombre}?`)).isConfirmed) return;
    operacion.ejecutar(async () => {
      await cambiarActivoCatalogo(tipo, id, !item.activo);
      estado.recargar();
    }, "Estado actualizado.");
  }

  return <Pagina titulo={esBase ? "Productos base" : "Marcas"}
    acciones={<Link className="btn btn--primary" to={`${ruta}/nuevo`}>Nuevo registro</Link>}>
    <Mensajes {...operacion} />
    <EstadoConsulta estado={estado}>
      {estado.datos && <Tarjeta>
        {estado.datos.length === 0 ? <p>No hay registros.</p> : <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Nombre</th>{esBase && <><th>Código</th><th>Fórmula</th><th>Comparabilidad revisada</th></>}<th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>{estado.datos.map((item) => {
              const id = item[campoIdCatalogo(tipo)];
              return <tr key={id}>
                <td>{item.nombre}</td>
                {esBase && <><td>{item.codigo}</td><td>{item.formulaDeclarada || "—"}</td><td>{item.comparabilidadRevisada ? "Sí" : "No"}</td></>}
                <td>{item.activo ? "Activo" : "Inactivo"}</td>
                <td><Link className="btn btn--secondary" to={`${ruta}/editar/${id}`}>Editar</Link>{" "}
                  <button type="button" className="btn btn--secondary" disabled={operacion.ocupado} onClick={() => cambiar(item)}>{item.activo ? "Desactivar" : "Activar"}</button></td>
              </tr>;
            })}</tbody>
          </table>
        </div>}
      </Tarjeta>}
    </EstadoConsulta>
  </Pagina>;
}
