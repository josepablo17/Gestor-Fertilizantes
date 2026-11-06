import { useMemo, useState } from "react";
import { obtenerProveedores, desactivarProveedor } from "../../api/proveedorApi.js";
import ContenidoListado from "../comunes/ContenidoListado.jsx";
import { Mensajes } from "../comunes/Pagina.jsx";
import useConsulta from "../../hooks/useConsulta.js";
import useDesactivarRegistro from "../../hooks/useDesactivarRegistro.js";
import Paginador from "../comunes/Paginador.jsx";
import usePaginacion from "../../hooks/usePaginacion.js";
import { filtrarProveedores } from "../../utils/proveedores.js";
import FiltroProveedores from "./FiltroProveedores.jsx";
import TablaProveedores from "./TablaProveedores.jsx";

const sinRegistros = [];

export default function ListaProveedores() {
  const estado = useConsulta(obtenerProveedores);
  const proveedores = estado.datos ?? sinRegistros;
  const operacion = useDesactivarRegistro(desactivarProveedor, estado.recargar);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const filtrados = useMemo(
    () => filtrarProveedores(proveedores, busqueda, filtroEstado),
    [proveedores, busqueda, filtroEstado]
  );
  const { itemsPaginados, indiceInicial, indiceFinal, ...paginador } =
    usePaginacion(filtrados, 5, [busqueda, filtroEstado]);
  const cantidad = filtrados.length;
  const resumen = `Mostrando ${indiceInicial + 1}-${Math.min(indiceFinal, cantidad)} de ${cantidad} ${cantidad === 1 ? "proveedor" : "proveedores"}`;

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroEstado("todos");
  }

  return (
    <>
      <Mensajes {...operacion} />
      <ContenidoListado estado={estado}
        mensajeVacio="No hay proveedores registrados"
        detalleVacio="Cuando agregues proveedores, aparecerán aquí para administrarlos."
        resumen={resumen}
        sinCoincidencias={cantidad === 0}
        filtros={<FiltroProveedores
          busqueda={busqueda} setBusqueda={setBusqueda}
          filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado}
          onLimpiarFiltros={limpiarFiltros}
        />}>
        <TablaProveedores proveedores={itemsPaginados}
          ocupado={operacion.ocupado}
          onDesactivar={(item) => operacion.desactivar(item.idProveedor, item.nombre)} />
        <Paginador {...paginador} />
      </ContenidoListado>
    </>
  );
}
