import { useMemo, useState } from "react";
import { obtenerPresentacionesProducto, desactivarPresentacionProducto } from "../../api/presentacionProductoApi.js";
import ContenidoListado from "../comunes/ContenidoListado.jsx";
import { Mensajes } from "../comunes/Pagina.jsx";
import useConsulta from "../../hooks/useConsulta.js";
import useDesactivarRegistro from "../../hooks/useDesactivarRegistro.js";
import Paginador from "../comunes/Paginador.jsx";
import usePaginacion from "../../hooks/usePaginacion.js";
import { filtrarPresentacionesProducto, obtenerProductosDisponibles, obtenerUnidadesMedidaDisponibles } from "../../utils/presentacionProductos.js";
import FiltrosPresentacionesProducto from "./FiltroPresentacionProducto.jsx";
import TablaPresentacionProductos from "./TablaPresentacionProductos.jsx";

const sinRegistros = [];

export default function ListaPresentacionProductos() {
  const estado = useConsulta(obtenerPresentacionesProducto);
  const presentaciones = estado.datos ?? sinRegistros;
  const operacion = useDesactivarRegistro(desactivarPresentacionProducto, estado.recargar);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroProducto, setFiltroProducto] = useState("todos");
  const [filtroUnidadMedida, setFiltroUnidadMedida] = useState("todas");

  const productosDisponibles = useMemo(() => obtenerProductosDisponibles(presentaciones), [presentaciones]);
  const unidadesMedidaDisponibles = useMemo(() => obtenerUnidadesMedidaDisponibles(presentaciones), [presentaciones]);
  const filtrados = useMemo(
    () => filtrarPresentacionesProducto(presentaciones, busqueda, filtroEstado, filtroProducto, filtroUnidadMedida),
    [presentaciones, busqueda, filtroEstado, filtroProducto, filtroUnidadMedida]
  );
  const { itemsPaginados, indiceInicial, indiceFinal, ...paginador } =
    usePaginacion(filtrados, 5, [busqueda, filtroEstado, filtroProducto, filtroUnidadMedida]);
  const cantidad = filtrados.length;
  const resumen = `Mostrando ${indiceInicial + 1}-${Math.min(indiceFinal, cantidad)} de ${cantidad} ${cantidad === 1 ? "presentación" : "presentaciones"}`;

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroEstado("todos");
    setFiltroProducto("todos");
    setFiltroUnidadMedida("todas");
  }

  return (
    <>
      <Mensajes {...operacion} />
      <ContenidoListado estado={estado}
        mensajeVacio="No hay presentaciones de producto registradas"
        detalleVacio="Cuando agregues presentaciones, aparecerán aquí para administrarlas."
        resumen={resumen}
        sinCoincidencias={cantidad === 0}
        filtros={<FiltrosPresentacionesProducto
          busqueda={busqueda} setBusqueda={setBusqueda}
          filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado}
          filtroProducto={filtroProducto} setFiltroProducto={setFiltroProducto}
          filtroUnidadMedida={filtroUnidadMedida} setFiltroUnidadMedida={setFiltroUnidadMedida}
          productosDisponibles={productosDisponibles}
          unidadesMedidaDisponibles={unidadesMedidaDisponibles}
          onLimpiarFiltros={limpiarFiltros}
        />}>
        <TablaPresentacionProductos presentacionesProducto={itemsPaginados}
          ocupado={operacion.ocupado}
          onDesactivar={(item) => operacion.desactivar(item.idPresentacionProducto, item.descripcion)} />
        <Paginador {...paginador} />
      </ContenidoListado>
    </>
  );
}
