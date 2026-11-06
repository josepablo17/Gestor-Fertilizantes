import { useState } from "react";
import { obtenerProductos } from "../api/productosApi.js";
import { obtenerPresentacionesProducto } from "../api/presentacionProductoApi.js";
import FiltrosComparadorProveedor from "../componentes/comparadorProveedor/FiltrosComparadorProveedor.jsx";
import ResumenComparadorProveedor from "../componentes/comparadorProveedor/ResumenComparadorProveedor.jsx";
import TablaComparadorProveedor from "../componentes/comparadorProveedor/TablaComparadorProveedor.jsx";
import ModalDetalleProveedor from "../componentes/comparadorProveedor/ModalDetalleProveedor.jsx";
import Pagina, { EstadoConsulta, EstadoVacio, Mensajes, Tarjeta } from "../componentes/comunes/Pagina.jsx";
import useComparadorProveedor from "../hooks/useComparadorProveedor.js";
import useConsulta from "../hooks/useConsulta.js";
import { mostrarError } from "../utils/alertas.js";

const filtrosIniciales = {
  idProducto: "", idPresentacionProducto: "", moneda: "", mesesAnalisis: 12, soloAutorizados: false
};

export default function ComparadorProveedor() {
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const productos = useConsulta(obtenerProductos);
  const presentaciones = useConsulta(obtenerPresentacionesProducto);
  const presentacionesFiltradas = presentaciones.datos?.filter(
    (presentacion) => String(presentacion.idProducto) === filtros.idProducto
  ) ?? [];

  const {
    filtrosAplicados, resumen, proveedores, cargando, error, detalleProveedor,
    consultarComparativa, consultarDetalleProveedor, cerrarModalDetalle, limpiarComparativa
  } = useComparadorProveedor();

  async function manejarComparar() {
    if (!filtros.idProducto || !filtros.idPresentacionProducto || !filtros.moneda) {
      await mostrarError("Filtros requeridos", "Selecciona un producto, una presentación y una moneda.");
      return;
    }

    await consultarComparativa(filtros);
  }

  function manejarLimpiar() {
    setFiltros(filtrosIniciales);
    limpiarComparativa();
  }

  const estadoCatalogo = {
    cargando: productos.cargando || presentaciones.cargando,
    error: productos.error || presentaciones.error,
    recargar: productos.error ? productos.recargar : presentaciones.recargar
  };
  const moneda = filtrosAplicados?.moneda;

  return (
    <Pagina titulo="Comparador de proveedores"
      descripcion="Analiza precios, estabilidad y comportamiento histórico para tomar mejores decisiones."
      acciones={<button type="button" className="btn btn--primary btn--md"
        disabled={cargando || estadoCatalogo.cargando || Boolean(estadoCatalogo.error)} onClick={manejarComparar}>
        Comparar
      </button>}>
      <Tarjeta>
        <EstadoConsulta estado={estadoCatalogo}>
          <FiltrosComparadorProveedor productos={productos.datos ?? []} presentaciones={presentacionesFiltradas}
            filtros={filtros} setFiltros={setFiltros} ocupado={cargando}
            onComparar={manejarComparar} onLimpiar={manejarLimpiar} />
        </EstadoConsulta>
      </Tarjeta>
      <Mensajes error={error} />
      <EstadoConsulta estado={{ cargando }}>
        {resumen && <Tarjeta><ResumenComparadorProveedor resumen={resumen} moneda={moneda} /></Tarjeta>}
        {proveedores.length > 0 && (
          <Tarjeta>
            <TablaComparadorProveedor proveedores={proveedores} moneda={moneda}
              onVerDetalle={(idProveedor) => consultarDetalleProveedor({ ...filtrosAplicados, idProveedor })} />
          </Tarjeta>
        )}
        {!filtrosAplicados && !error && !estadoCatalogo.cargando && !estadoCatalogo.error && (
          <Tarjeta>
            <EstadoVacio mensaje="Seleccione un producto"
              detalle="Use los filtros para comparar proveedores y analizar precios." />
          </Tarjeta>
        )}
      </EstadoConsulta>
      {detalleProveedor && (
        <ModalDetalleProveedor detalleProveedor={detalleProveedor} moneda={moneda} onCerrar={cerrarModalDetalle} />
      )}
    </Pagina>
  );
}
