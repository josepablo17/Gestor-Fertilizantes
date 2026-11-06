import { useMemo, useState } from "react";
import { obtenerProductos, desactivarProducto } from "../../api/productosApi.js";
import ContenidoListado from "../comunes/ContenidoListado.jsx";
import { Mensajes } from "../comunes/Pagina.jsx";
import useConsulta from "../../hooks/useConsulta.js";
import useDesactivarRegistro from "../../hooks/useDesactivarRegistro.js";
import Paginador from "../comunes/Paginador.jsx";
import usePaginacion from "../../hooks/usePaginacion.js";
import { filtrarProductos, obtenerCategoriasDisponibles } from "../../utils/productos.js";
import FiltrosProductos from "./FiltroProductos.jsx";
import TablaProductos from "./TablaProductos.jsx";

const sinRegistros = [];

export default function ListaProductos() {
  const estado = useConsulta(obtenerProductos);
  const productos = estado.datos ?? sinRegistros;
  const operacion = useDesactivarRegistro(desactivarProducto, estado.recargar);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");

  const categoriasDisponibles = useMemo(() => obtenerCategoriasDisponibles(productos), [productos]);
  const filtrados = useMemo(
    () => filtrarProductos(productos, busqueda, filtroEstado, filtroCategoria),
    [productos, busqueda, filtroEstado, filtroCategoria]
  );
  const { itemsPaginados, indiceInicial, indiceFinal, ...paginador } =
    usePaginacion(filtrados, 5, [busqueda, filtroEstado, filtroCategoria]);
  const cantidad = filtrados.length;
  const resumen = `Mostrando ${indiceInicial + 1}-${Math.min(indiceFinal, cantidad)} de ${cantidad} ${cantidad === 1 ? "producto" : "productos"}`;

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroEstado("todos");
    setFiltroCategoria("todas");
  }

  return (
    <>
      <Mensajes {...operacion} />
      <ContenidoListado estado={estado}
        mensajeVacio="No hay productos registrados"
        detalleVacio="Cuando agregues productos, aparecerán aquí para administrarlos."
        resumen={resumen}
        sinCoincidencias={cantidad === 0}
        filtros={<FiltrosProductos
          busqueda={busqueda} setBusqueda={setBusqueda}
          filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado}
          filtroCategoria={filtroCategoria} setFiltroCategoria={setFiltroCategoria}
          categoriasDisponibles={categoriasDisponibles}
          onLimpiarFiltros={limpiarFiltros}
        />}>
        <TablaProductos productos={itemsPaginados}
          ocupado={operacion.ocupado}
          onDesactivar={(item) => operacion.desactivar(item.idProducto, item.nombre)} />
        <Paginador {...paginador} />
      </ContenidoListado>
    </>
  );
}
