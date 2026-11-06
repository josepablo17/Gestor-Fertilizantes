import { useMemo, useState } from "react";
import { obtenerCompras } from "../../api/compraApi.js";
import ContenidoListado from "../comunes/ContenidoListado.jsx";
import useConsulta from "../../hooks/useConsulta.js";
import Paginador from "../comunes/Paginador.jsx";
import usePaginacion from "../../hooks/usePaginacion.js";
import { filtrarCompras, obtenerMonedasDisponibles, obtenerTendenciasDisponibles } from "../../utils/compras.js";
import FiltrosCompras from "./FiltroCompras.jsx";
import TablaCompras from "./TablaCompras.jsx";

const sinRegistros = [];

export default function ListaCompras() {
  const estado = useConsulta(obtenerCompras);
  const compras = estado.datos ?? sinRegistros;

  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [busquedaProveedor, setBusquedaProveedor] = useState("");
  const [filtroMoneda, setFiltroMoneda] = useState("todas");
  const [filtroTendencia, setFiltroTendencia] = useState("todas");
  const [filtroFecha, setFiltroFecha] = useState("");

  const monedasDisponibles = useMemo(() => obtenerMonedasDisponibles(compras), [compras]);
  const tendenciasDisponibles = useMemo(() => obtenerTendenciasDisponibles(compras), [compras]);
  const filtrados = useMemo(
    () => filtrarCompras(compras, busquedaProducto, busquedaProveedor, filtroMoneda, filtroTendencia, filtroFecha),
    [compras, busquedaProducto, busquedaProveedor, filtroMoneda, filtroTendencia, filtroFecha]
  );
  const { itemsPaginados, indiceInicial, indiceFinal, ...paginador } =
    usePaginacion(filtrados, 5, [busquedaProducto, busquedaProveedor, filtroMoneda, filtroTendencia, filtroFecha]);
  const cantidad = filtrados.length;
  const resumen = `Mostrando ${indiceInicial + 1}-${Math.min(indiceFinal, cantidad)} de ${cantidad} ${cantidad === 1 ? "compra" : "compras"}`;

  function limpiarFiltros() {
    setBusquedaProducto("");
    setBusquedaProveedor("");
    setFiltroMoneda("todas");
    setFiltroTendencia("todas");
    setFiltroFecha("");
  }

  return (
    <ContenidoListado estado={estado}
      mensajeVacio="No hay compras registradas"
      detalleVacio="Cuando registres compras, aparecerán aquí para analizarlas."
      resumen={resumen}
      sinCoincidencias={cantidad === 0}
      filtros={<FiltrosCompras
        busquedaProducto={busquedaProducto} setBusquedaProducto={setBusquedaProducto}
        busquedaProveedor={busquedaProveedor} setBusquedaProveedor={setBusquedaProveedor}
        filtroMoneda={filtroMoneda} setFiltroMoneda={setFiltroMoneda}
        filtroTendencia={filtroTendencia} setFiltroTendencia={setFiltroTendencia}
        filtroFecha={filtroFecha} setFiltroFecha={setFiltroFecha}
        monedasDisponibles={monedasDisponibles}
        tendenciasDisponibles={tendenciasDisponibles}
        onLimpiarFiltros={limpiarFiltros}
      />}>
      <TablaCompras compras={itemsPaginados} />
      <Paginador {...paginador} />
    </ContenidoListado>
  );
}
